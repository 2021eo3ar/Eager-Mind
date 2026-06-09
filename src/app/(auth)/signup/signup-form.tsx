"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bookmark, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { signUpAction } from "./actions";
import { signupSchema, type SignupInput } from "@/lib/validations";

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  function onSubmit(values: SignupInput) {
    setMessage(null);
    startTransition(async () => {
      const result = await signUpAction(values);
      setMessage({ type: result.success ? "success" : "error", text: result.message });
    });
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Bookmark className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Bookmarks</h1>
        <p className="mt-2 text-sm text-slate-500">Create your private bookmark workspace.</p>
      </div>

      {message ? (
        <div className={`mb-5 rounded-lg p-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" type="email" {...register("email")} />
          {errors.email ? <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span> : null}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Handle</span>
          <div className="mt-1 flex rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500">
            <span className="flex items-center px-3 text-sm text-slate-400">@</span>
            <input className="w-full rounded-r-lg px-0 py-2 pr-3 text-sm outline-none" placeholder="username" {...register("handle")} />
          </div>
          {errors.handle ? <span className="mt-1 block text-xs text-red-600">{errors.handle.message}</span> : null}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <div className="mt-1 flex rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500">
            <input className="w-full rounded-l-lg px-3 py-2 text-sm outline-none" type={showPassword ? "text" : "password"} {...register("password")} />
            <button className="px-3 text-slate-500" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span> : null}
        </label>

        <button className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link className="font-medium text-indigo-600 hover:text-indigo-700" href="/login">Sign in</Link>
      </p>
    </div>
  );
}
