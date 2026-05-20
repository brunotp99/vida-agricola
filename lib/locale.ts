"use server";
import { cookies } from "next/headers";

const LOCALE_COOKIE = "NEXT_LOCALE";

export async function getUserLocale() {
  return (await cookies()).get(LOCALE_COOKIE)?.value ?? "en";
}

export async function setUserLocale(locale: string) {
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
