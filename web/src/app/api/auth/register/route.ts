import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email, password, name, role } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .insert({ email, name, password_hash: passwordHash, role: role === "DEALER" ? "DEALER" : "BUYER" })
    .select("id, email, name, role")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user }, { status: 201 });
}
