"use client";

import { useEffect, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { bookmarkSchema, type BookmarkInput } from "@/lib/validations";

export type BookmarkRecord = {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  created_at: string;
};

type BookmarkModalProps = {
  open: boolean;
  bookmark?: BookmarkRecord | null;
  onClose: () => void;
  onSubmit: (values: BookmarkInput) => Promise<void>;
};

export function BookmarkModal({ open, bookmark, onClose, onSubmit }: BookmarkModalProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BookmarkInput>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      title: "",
      url: "",
      is_public: false,
    },
  });

  useEffect(() => {
    reset({
      title: bookmark?.title || "",
      url: bookmark?.url || "",
      is_public: bookmark?.is_public || false,
    });
  }, [bookmark, reset, open]);

  if (!open) {
    return null;
  }

  const isPublic = watch("is_public");

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-slate-900/30" type="button" aria-label="Close modal" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{bookmark ? "Edit bookmark" : "Add bookmark"}</h2>
            <p className="mt-1 text-sm text-slate-500">Save the pages you want to keep close.</p>
          </div>
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) => {
            startTransition(async () => {
              await onSubmit(values);
            });
          })}
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" {...register("title")} />
            {errors.title ? <span className="mt-1 block text-xs text-red-600">{errors.title.message}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">URL</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://example.com" {...register("url")} />
            {errors.url ? <span className="mt-1 block text-xs text-red-600">{errors.url.message}</span> : null}
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <span>
              <span className="block text-sm font-medium text-slate-900">Public profile</span>
              <span className="mt-1 block text-sm text-slate-500">Show this bookmark on your public page.</span>
            </span>
            <input className="peer sr-only" type="checkbox" {...register("is_public")} />
            <span className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-indigo-600 peer-checked:after:translate-x-5" />
          </label>
          <input type="hidden" value={String(isPublic)} readOnly />

          <div className="flex gap-3 pt-2">
            <button className="flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-70" type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {bookmark ? "Save changes" : "Add bookmark"}
            </button>
            <button className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
