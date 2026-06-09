"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/utils";
import { signupSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

type SignupState = {
  success: boolean;
  message: string;
};

export async function signUpAction(input: unknown): Promise<SignupState> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || "Invalid signup details" };
  }

  const { email, password, handle } = parsed.data;
  const supabase = createAdminClient();

  const { data: existingHandle, error: handleError } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (handleError) {
    return { success: false, message: handleError.message };
  }

  if (existingHandle) {
    return { success: false, message: "That handle is already taken" };
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: { handle },
      redirectTo: `${getAppUrl()}/dashboard`,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (data.user?.id) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: data.user.id, handle }, { onConflict: "id" });

    if (profileError) {
      return { success: false, message: profileError.message };
    }
  }

  const confirmationUrl = data.properties?.action_link || `${getAppUrl()}/login`;
  const emailResult = await sendWelcomeEmail({ email, handle, confirmationUrl });

  if ("error" in emailResult && emailResult.error) {
    return { success: false, message: emailResult.error.message };
  }

  return {
    success: true,
    message: "Check your email to confirm your account",
  };
}
