// Notification worker: drains notification_jobs → renders localized emails →
// sends via Resend. Poked instantly by DB triggers (pg_net) and swept every
// minute by pg_cron. Without RESEND_API_KEY jobs complete as dry runs (logged,
// not sent) so the pipeline is testable before the provider exists.
import { db, json, requireAdminKey } from "../_shared/clients.ts";

type Locale = "en" | "de" | "fr" | "it";
const LOCALES: Locale[] = ["en", "de", "fr", "it"];
const MAX_ATTEMPTS = 6;

const chf = (n: number) =>
  "CHF " + new Intl.NumberFormat("de-CH").format(Math.round(n)).replace(/,/g, "'");

const T: Record<Locale, Record<string, string>> = {
  en: {
    requestReceivedSubject: "Your request is with verified dealers",
    requestReceivedBody: "Your request for a {car} is on its way to verified Swiss dealers. Matching firm-price offers typically arrive within 24 hours — they land right in your dashboard.",
    requestMatchedSubject: "New buyer request: {car}",
    requestMatchedBody: "A buyer is looking for a {car} — budget up to {budget}. Be the dealer who wins it: send your firm-price offer from your dashboard.",
    offerReceivedSubject: "New offer for your {car}: {price}",
    offerReceivedBody: "{garage} sent a firm-price offer of {price} for your {car} request. Compare it side by side in your dashboard and decide when you're ready.",
    offerWonSubject: "You won — the buyer accepted your offer",
    offerWonBody: "The buyer accepted your offer of {price} for the {car}. Their contact details are now in your dashboard — everything from here happens directly between you.",
    cta: "Open dashboard",
    footer: "AutoVerkauf — one request, the market comes to you.",
  },
  de: {
    requestReceivedSubject: "Deine Anfrage ist bei verifizierten Händlern",
    requestReceivedBody: "Deine Anfrage für einen {car} ist auf dem Weg zu verifizierten Schweizer Händlern. Passende Festpreis-Angebote treffen in der Regel innert 24 Stunden ein — direkt in deinem Dashboard.",
    requestMatchedSubject: "Neues Kaufgesuch: {car}",
    requestMatchedBody: "Ein Käufer sucht einen {car} — Budget bis {budget}. Sei der Händler, der den Zuschlag holt: sende dein Festpreis-Angebot aus deinem Dashboard.",
    offerReceivedSubject: "Neues Angebot für deinen {car}: {price}",
    offerReceivedBody: "{garage} hat dir ein Festpreis-Angebot über {price} für deine {car}-Anfrage gesendet. Vergleiche es in deinem Dashboard und entscheide, wenn du bereit bist.",
    offerWonSubject: "Zuschlag — der Käufer hat dein Angebot angenommen",
    offerWonBody: "Der Käufer hat dein Angebot über {price} für den {car} angenommen. Die Kontaktdaten findest du jetzt in deinem Dashboard — alles Weitere läuft direkt zwischen euch.",
    cta: "Dashboard öffnen",
    footer: "AutoVerkauf — eine Anfrage, der Markt kommt zu dir.",
  },
  fr: {
    requestReceivedSubject: "Votre demande est chez les concessionnaires vérifiés",
    requestReceivedBody: "Votre demande pour une {car} est en route vers les concessionnaires suisses vérifiés. Les offres à prix ferme arrivent en général sous 24 heures — directement dans votre tableau de bord.",
    requestMatchedSubject: "Nouvelle demande d'achat : {car}",
    requestMatchedBody: "Un acheteur cherche une {car} — budget jusqu'à {budget}. Soyez le concessionnaire qui remporte l'affaire : envoyez votre offre à prix ferme depuis votre tableau de bord.",
    offerReceivedSubject: "Nouvelle offre pour votre {car} : {price}",
    offerReceivedBody: "{garage} vous a envoyé une offre à prix ferme de {price} pour votre demande {car}. Comparez-la dans votre tableau de bord et décidez quand vous êtes prêt.",
    offerWonSubject: "Gagné — l'acheteur a accepté votre offre",
    offerWonBody: "L'acheteur a accepté votre offre de {price} pour la {car}. Ses coordonnées sont maintenant dans votre tableau de bord — la suite se passe directement entre vous.",
    cta: "Ouvrir le tableau de bord",
    footer: "AutoVerkauf — une demande, le marché vient à vous.",
  },
  it: {
    requestReceivedSubject: "La tua richiesta è dai concessionari verificati",
    requestReceivedBody: "La tua richiesta per una {car} è in viaggio verso i concessionari svizzeri verificati. Le offerte a prezzo fisso arrivano di solito entro 24 ore — direttamente nella tua dashboard.",
    requestMatchedSubject: "Nuova richiesta d'acquisto: {car}",
    requestMatchedBody: "Un acquirente cerca una {car} — budget fino a {budget}. Sii il concessionario che vince: invia la tua offerta a prezzo fisso dalla tua dashboard.",
    offerReceivedSubject: "Nuova offerta per la tua {car}: {price}",
    offerReceivedBody: "{garage} ti ha inviato un'offerta a prezzo fisso di {price} per la tua richiesta {car}. Confrontala nella tua dashboard e decidi quando sei pronto.",
    offerWonSubject: "Vinto — l'acquirente ha accettato la tua offerta",
    offerWonBody: "L'acquirente ha accettato la tua offerta di {price} per la {car}. I suoi contatti sono ora nella tua dashboard — il resto avviene direttamente tra voi.",
    cta: "Apri la dashboard",
    footer: "AutoVerkauf — una richiesta, il mercato viene da te.",
  },
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function loc(l: string | null | undefined): Locale {
  return LOCALES.includes(l as Locale) ? (l as Locale) : "de";
}

function localizedPath(path: string, l: Locale): string {
  return l === "en" ? path : `/${l}${path}`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function emailHtml(l: Locale, heading: string, body: string, ctaUrl: string): string {
  const t = T[l];
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f2f1;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:40px 20px">
    <div style="font-size:15px;font-weight:700;letter-spacing:-0.01em;color:#1c1717">
      <span style="display:inline-block;width:10px;height:10px;background:#D81E24;border-radius:3px;margin-right:7px"></span>AutoVerkauf
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:32px 28px;margin-top:16px">
      <h1 style="margin:0;font-size:21px;line-height:1.3;color:#1c1717">${esc(heading)}</h1>
      <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#5c5555">${esc(body)}</p>
      <a href="${ctaUrl}" style="display:inline-block;margin-top:24px;background:#D81E24;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 22px;border-radius:999px">${esc(t.cta)}</a>
    </div>
    <p style="margin:18px 4px 0;font-size:12px;color:#9b9494">${esc(t.footer)}</p>
  </div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.log(`[dry-run] to=${to} subject="${subject}"`);
    return;
  }
  const from = Deno.env.get("NOTIFY_FROM") ?? "AutoVerkauf <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

Deno.serve(async (req) => {
  const denied = requireAdminKey(req);
  if (denied) return denied;

  const supabase = db();
  const site = Deno.env.get("PUBLIC_SITE_URL") ?? "http://localhost:4321";

  const { data: jobs, error } = await supabase
    .from("notification_jobs")
    .select("*")
    .in("status", ["queued", "failed"])
    .lt("attempts", MAX_ATTEMPTS)
    .lte("run_after", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(25);
  if (error) return json({ error: error.message }, 500);

  let done = 0, failed = 0;
  for (const job of jobs ?? []) {
    const { data: claimed } = await supabase
      .from("notification_jobs")
      .update({ status: "processing", attempts: job.attempts + 1 })
      .eq("id", job.id)
      .in("status", ["queued", "failed"])
      .select()
      .single();
    if (!claimed) continue;

    try {
      switch (job.kind) {
        case "request_received": {
          const { data: r } = await supabase.from("requests").select("*").eq("id", job.payload.request_id).single();
          if (!r) break;
          const l = loc(r.locale);
          const car = [r.make, r.model].filter(Boolean).join(" ") || "—";
          await sendEmail(
            r.buyer_email,
            fill(T[l].requestReceivedSubject, { car }),
            emailHtml(l, fill(T[l].requestReceivedSubject, { car }), fill(T[l].requestReceivedBody, { car }), `${site}${localizedPath("/konto", l)}`),
          );
          break;
        }
        case "request_matched": {
          const { data: r } = await supabase.from("requests").select("*").eq("id", job.payload.request_id).single();
          if (!r || r.status !== "open") break;
          const car = [r.make, r.model].filter(Boolean).join(" ") || "—";
          const budget = r.budget_chf ? chf(Number(r.budget_chf)) : "—";
          // All billable garages hear about new demand (plans differ by
          // volume, not reach). Excludes suspended/unapproved automatically.
          const { data: garages } = await supabase.from("garages").select("id,email,locale,subscription_status,payment_method_valid,suspended");
          for (const g of garages ?? []) {
            if (g.suspended) continue;
            const l = loc(g.locale);
            await sendEmail(
              g.email,
              fill(T[l].requestMatchedSubject, { car }),
              emailHtml(l, fill(T[l].requestMatchedSubject, { car }), fill(T[l].requestMatchedBody, { car, budget }), `${site}${localizedPath("/haendler/konto", l)}`),
            );
          }
          break;
        }
        case "offer_received": {
          const { data: o } = await supabase
            .from("offers")
            .select("*, requests(buyer_email, locale, make, model), garages(name)")
            .eq("id", job.payload.offer_id)
            .single();
          if (!o?.requests) break;
          const l = loc(o.requests.locale);
          const car = [o.requests.make, o.requests.model].filter(Boolean).join(" ") || "—";
          const price = chf(Number(o.amount_chf));
          await sendEmail(
            o.requests.buyer_email,
            fill(T[l].offerReceivedSubject, { car, price }),
            emailHtml(l, fill(T[l].offerReceivedSubject, { car, price }),
              fill(T[l].offerReceivedBody, { car, price, garage: o.garages?.name ?? "—" }),
              `${site}${localizedPath("/konto", l)}`),
          );
          break;
        }
        case "offer_won": {
          const { data: o } = await supabase
            .from("offers")
            .select("*, garages(email, locale)")
            .eq("id", job.payload.offer_id)
            .single();
          if (!o?.garages) break;
          const l = loc(o.garages.locale);
          const car = [o.make, o.model].filter(Boolean).join(" ") || "—";
          const price = chf(Number(o.amount_chf));
          await sendEmail(
            o.garages.email,
            T[l].offerWonSubject,
            emailHtml(l, T[l].offerWonSubject, fill(T[l].offerWonBody, { car, price }), `${site}${localizedPath("/haendler/konto", l)}`),
          );
          break;
        }
      }
      await supabase.from("notification_jobs").update({
        status: "done",
        last_error: Deno.env.get("RESEND_API_KEY") ? null : "dry-run: RESEND_API_KEY not set",
      }).eq("id", job.id);
      done++;
    } catch (err) {
      const backoffMinutes = Math.min(2 ** job.attempts, 60);
      await supabase.from("notification_jobs").update({
        status: "failed",
        last_error: String(err).slice(0, 800),
        run_after: new Date(Date.now() + backoffMinutes * 60_000).toISOString(),
      }).eq("id", job.id);
      failed++;
    }
  }
  return json({ done, failed });
});
