import Link from "next/link";
import { Bookmark, Globe2, Lock, Zap } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <nav className="mb-20 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Bookmark className="h-5 w-5" />
              </span>
              Bookmarks
            </div>
            <Link className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href="/login">
              Sign In
            </Link>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold leading-tight text-slate-900 sm:text-6xl">
              Your bookmarks, beautifully organized.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Save private links, publish curated favorites, and keep a fast personal collection that is easy to scan.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700" href="/signup">
                Get Started (free)
              </Link>
              <Link className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" href="/login">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Lock, title: "Private by default", body: "New bookmarks stay private until you choose to share them." },
            { icon: Globe2, title: "Public profiles", body: "Publish selected links on a clean handle-based profile." },
            { icon: Zap, title: "Clean & fast", body: "A focused dashboard keeps everyday saving and editing quick." },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <feature.icon className="h-6 w-6 text-indigo-600" />
              <h2 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Copyright {new Date().getFullYear()} Bookmarks
      </footer>
    </main>
  );
}
