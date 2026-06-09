import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardBookmarks } from "@/components/DashboardBookmarks";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard | Bookmarks",
};

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("id,title,url,is_public,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return <DashboardBookmarks bookmarks={bookmarks || []} />;
}
