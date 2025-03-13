"use server";

import { encodedRedirect } from "@/lib/utils";
import { createClient } from "@/lib/supabase-server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from '@prisma/client'

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString();  // フォームから取得
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const prisma = new PrismaClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    // ユーザーが作成された後、Prismaを使ってUSERSテーブルに情報を保存
    const userId = data.user?.id;

    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            email: email,
            full_name: fullName,
            updated_at: new Date()
          }
        });
      } catch (dbError) {
        console.error("Failed to create user profile:", dbError);
      }
    }

    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // エラーメッセージを日本語に変換
    let japaneseErrorMessage = "ログインに失敗しました。";

    // エラーメッセージに応じて日本語のメッセージを設定
    if (error.message.includes("Invalid login credentials")) {
      japaneseErrorMessage = "メールアドレスまたはパスワードが正しくありません。";
    } else if (error.message.includes("Email not confirmed")) {
      japaneseErrorMessage = "メールアドレスが確認されていません。メールをご確認ください。";
    } else if (error.message.includes("Too many requests")) {
      japaneseErrorMessage = "ログイン試行回数が多すぎます。しばらく経ってから再度お試しください。";
    }
    return encodedRedirect("error", "/sign-in", japaneseErrorMessage);
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};