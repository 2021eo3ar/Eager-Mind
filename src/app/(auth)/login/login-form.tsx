"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bookmark, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginAction } from "./actions";
import { loginSchema, type LoginInput } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: LoginInput) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(values);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Bookmark className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Bookmarks</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to your bookmark collection.</p>
      </div>

      {error ? <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500" type="email" {...register("email")} />
          {errors.email ? <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span> : null}
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

        <div className="flex justify-end">
          <Link className="text-sm font-medium text-indigo-600 hover:text-indigo-700" href="/login">Forgot password?</Link>
        </div>

        <button className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Bookmarks? <Link className="font-medium text-indigo-600 hover:text-indigo-700" href="/signup">Create an account</Link>
      </p>
    </div>
  );
}
