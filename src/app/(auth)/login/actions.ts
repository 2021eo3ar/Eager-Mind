"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";

type LoginState = {
  success: boolean;
  message: string;
};

export async function loginAction(input: unknown): Promise<LoginState> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || "Invalid login details" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, message: "Invalid email or password" };
  }

  return { success: true, message: "Signed in" };
}
