import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PublicPageProps = {
  params: {
    handle: string;
  };
};

function normalizeHandle(handle: string) {
  return decodeURIComponent(handle).replace(/^@/, "").toLowerCase();
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const handle = normalizeHandle(params.handle);

  return {
    title: `@${handle}'s Bookmarks`,
    description: `Public bookmarks shared by @${handle}.`,
  };
}

export default async function PublicProfilePage({ params }: PublicPageProps) {
  const handle = normalizeHandle(params.handle);
  const supabase = createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,handle")
    .ilike("handle", handle)
    .maybeSingle();

  if (profileError || !profile) {
    notFound();
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("id,title,url,is_public,created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Bookmark className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">@{profile.handle}&apos;s Bookmarks</h1>
          <p className="mt-2 text-sm text-slate-500">{bookmarks?.length || 0} public bookmarks shared.</p>
        </header>

        {!bookmarks || bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <h2 className="text-lg font-semibold text-slate-900">@{profile.handle} hasn&apos;t shared any public bookmarks yet.</h2>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark) => {
              const domain = getDomain(bookmark.url);
              return (
                <a key={bookmark.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md" href={bookmark.url} target="_blank" rel="noreferrer">
                  <div className="mb-4 flex items-start gap-3">
                    <img className="h-8 w-8 rounded" src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold text-slate-900">{bookmark.title}</h2>
                      <p className="truncate text-sm text-slate-500">{bookmark.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Public</span>
                    <span className="text-slate-500">{formatDate(bookmark.created_at)}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <Link className="font-medium text-indigo-600 hover:text-indigo-700" href="/">
          Bookmarks
        </Link>
      </footer>
    </main>
  );
}
