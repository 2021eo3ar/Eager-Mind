"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookmarkSchema, type BookmarkInput } from "@/lib/validations";

type ActionResult = {
  success: boolean;
  message: string;
};

async function getUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id };
}

export async function createBookmark(input: BookmarkInput): Promise<ActionResult> {
  const parsed = bookmarkSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || "Invalid bookmark" };
  }

  const { supabase, userId } = await getUserId();

  if (!userId) {
    return { success: false, message: "You must be signed in" };
  }

  const { error } = await supabase.from("bookmarks").insert({
    ...parsed.data,
    user_id: userId,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Bookmark added" };
}

export async function updateBookmark(id: string, input: BookmarkInput): Promise<ActionResult> {
  const parsed = bookmarkSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || "Invalid bookmark" };
  }

  const { supabase, userId } = await getUserId();

  if (!userId) {
    return { success: false, message: "You must be signed in" };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("bookmarks")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return { success: false, message: fetchError.message };
  }

  if (!existing || existing.user_id !== userId) {
    return { success: false, message: "Bookmark not found" };
  }

  const { error } = await supabase
    .from("bookmarks")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Bookmark updated" };
}

export async function deleteBookmark(id: string): Promise<ActionResult> {
  const { supabase, userId } = await getUserId();

  if (!userId) {
    return { success: false, message: "You must be signed in" };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("bookmarks")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return { success: false, message: fetchError.message };
  }

  if (!existing || existing.user_id !== userId) {
    return { success: false, message: "Bookmark not found" };
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Bookmark deleted" };
}
