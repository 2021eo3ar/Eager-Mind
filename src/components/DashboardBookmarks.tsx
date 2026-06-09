"use client";

import { useMemo, useState, useTransition } from "react";
import { Bookmark, Edit2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookmarkModal, type BookmarkRecord } from "@/components/BookmarkModal";
import { createBookmark, deleteBookmark, updateBookmark } from "@/app/(dashboard)/dashboard/actions";
import type { BookmarkInput } from "@/lib/validations";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

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

export function DashboardBookmarks({ bookmarks }: { bookmarks: BookmarkRecord[] }) {
  const router = useRouter();
  const [items, setItems] = useState(bookmarks);
  const [editing, setEditing] = useState<BookmarkRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [, startTransition] = useTransition();

  const countLabel = useMemo(() => `${items.length} ${items.length === 1 ? "bookmark" : "bookmarks"}`, [items.length]);

  function toast(type: Toast["type"], message: string) {
    const id = Date.now();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3500);
  }

  async function submitBookmark(values: BookmarkInput) {
    const result = editing ? await updateBookmark(editing.id, values) : await createBookmark(values);

    if (!result.success) {
      toast("error", result.message);
      return;
    }

    toast("success", result.message);
    setIsModalOpen(false);
    setEditing(null);
    router.refresh();
  }

  function handleDelete(bookmark: BookmarkRecord) {
    if (!window.confirm(`Delete "${bookmark.title}"?`)) {
      return;
    }

    const previous = items;
    setItems((current) => current.filter((item) => item.id !== bookmark.id));
    startTransition(async () => {
      const result = await deleteBookmark(bookmark.id);
      if (!result.success) {
        setItems(previous);
        toast("error", result.message);
        return;
      }
      toast("success", result.message);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">My Bookmarks</h1>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">{countLabel}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Keep private links organized and share the ones worth publishing.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          type="button"
          onClick={() => {
            setEditing(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Bookmark
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Bookmark className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No bookmarks yet</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">Add your first useful link and choose whether it stays private or appears on your public profile.</p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" type="button" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Bookmark
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((bookmark) => {
            const domain = getDomain(bookmark.url);
            return (
              <article key={bookmark.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-start gap-3">
                  <img className="h-8 w-8 rounded" src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} alt="" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-slate-900">{bookmark.title}</h2>
                    <p className="truncate text-sm text-slate-500">{bookmark.url}</p>
                  </div>
                </div>
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${bookmark.is_public ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {bookmark.is_public ? "Public" : "Private"}
                  </span>
                  <span className="text-slate-500">{formatDate(bookmark.created_at)}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" type="button" onClick={() => { setEditing(bookmark); setIsModalOpen(true); }} aria-label="Edit bookmark">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" type="button" onClick={() => handleDelete(bookmark)} aria-label="Delete bookmark">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <BookmarkModal open={isModalOpen} bookmark={editing} onClose={() => { setIsModalOpen(false); setEditing(null); }} onSubmit={submitBookmark} />

      <div className="fixed bottom-4 right-4 z-[60] space-y-2">
        {toasts.map((item) => (
          <div key={item.id} className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${item.type === "success" ? "bg-slate-900 text-white" : "bg-red-600 text-white"}`}>
            {item.message}
          </div>
        ))}
      </div>
    </>
  );
}
