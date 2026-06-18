import { Logo } from "@/components/logo";

export function Footer() {
  const LINKS = {
    Product: ["How it works", "For dealers", "Pricing", "Reviews"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy", "Terms", "Cookies", "Imprint"],
    Support: ["Help centre", "Contact", "Status", "Community"],
  };

  return (
    <footer className="bg-[oklch(0.112_0.012_27.0)] text-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Logo dark />
            </div>
            <p className="text-[13px] text-white/50 leading-relaxed max-w-[200px]">
              Switzerland's first buyer-first car marketplace.
            </p>
            {/* Lang */}
            <div className="flex gap-2 mt-6 flex-wrap">
              {["DE", "FR", "IT", "EN"].map((l) => (
                <button key={l} className="text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer">
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-white/60 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/30">
            © {new Date().getFullYear()} AutoVerkauf AG. All rights reserved. Made in Switzerland 🇨🇭
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[12px] text-white/30">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
