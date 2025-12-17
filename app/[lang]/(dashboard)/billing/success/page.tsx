import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import BillingSuccessClient from "@/components/billing-success-client";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);
  const titleByLocale: Record<Locale, string> = {
    zh: "订阅成功",
    en: "Subscription Successful",
    ja: "購読が完了しました",
    ko: "구독 완료",
    ru: "Подписка активирована",
    de: "Abo erfolgreich",
    pt: "Assinatura concluída",
    it: "Abbonamento attivato",
    ar: "تم تفعيل الاشتراك",
    es: "Suscripción activada",
    fr: "Abonnement activé",
  };
  const title = titleByLocale[locale];

  return {
    title,
    description: dictionary.billing.subtitle,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

export default async function BillingSuccessPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);

  const titleByLocale: Record<Locale, string> = {
    zh: "订阅成功",
    en: "Subscription successful",
    ja: "購読が完了しました",
    ko: "구독이 완료되었습니다",
    ru: "Подписка успешно оформлена",
    de: "Abo erfolgreich abgeschlossen",
    pt: "Assinatura ativada com sucesso",
    it: "Abbonamento attivato con successo",
    ar: "تم تفعيل الاشتراك بنجاح",
    es: "Suscripción activada correctamente",
    fr: "Abonnement activé avec succès",
  };
  const descByLocale: Record<Locale, string> = {
    zh: "正在为你开通订阅，可能需要几秒钟同步。",
    en: "Your subscription is being activated. It may take a few seconds to sync.",
    ja: "購読情報を反映中です。同期に数秒かかる場合があります。",
    ko: "구독을 활성화하는 중입니다. 동기화에 몇 초가 걸릴 수 있어요.",
    ru: "Подписка активируется. Синхронизация может занять несколько секунд.",
    de: "Dein Abo wird aktiviert. Die Synchronisierung kann ein paar Sekunden dauern.",
    pt: "Sua assinatura está sendo ativada. A sincronização pode levar alguns segundos.",
    it: "Stiamo attivando l’abbonamento. La sincronizzazione può richiedere alcuni secondi.",
    ar: "يتم الآن تفعيل الاشتراك. قد تستغرق المزامنة بضع ثوانٍ.",
    es: "Se está activando tu suscripción. La sincronización puede tardar unos segundos.",
    fr: "Votre abonnement est en cours d’activation. La synchronisation peut prendre quelques secondes.",
  };
  const title = titleByLocale[locale];
  const desc = descByLocale[locale];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#17171e] px-6 py-16 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/30 px-8 py-10 text-center shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-slate-300">{desc}</p>
        <BillingSuccessClient dictionary={dictionary} locale={locale} />
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/${locale}`}>
            <Button className="rounded-full">{dictionary.nav.demix}</Button>
          </Link>
          <Link href={`/${locale}/billing`}>
            <Button variant="outline" className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10">
              {dictionary.billing.manage}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
