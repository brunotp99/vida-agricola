import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/lib/locale";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  const validLocale = (routing.locales as readonly string[]).includes(locale) ? locale : routing.defaultLocale;
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
