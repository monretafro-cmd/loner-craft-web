import { useCallback } from "react";
import { BRAND } from "@/lib/brand";
import { useI18n } from "./index";

export type OrderMessage = {
  product?: string;
  name?: string;
  phone?: string;
  city?: string;
  address?: string;
  quantity?: number | string;
  note?: string;
  color?: string;
};

export function whatsappHref(message: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Builds the WhatsApp order message in the active language. */
export function useWhatsapp() {
  const { t } = useI18n();

  const orderMessage = useCallback(
    (input: OrderMessage = {}) =>
      [
        t("whatsapp.intro"),
        "",
        `${t("whatsapp.product")}: ${input.product ?? ""}`,
        ...(input.color !== undefined ? [`${t("whatsapp.color")}: ${input.color}`] : []),
        `${t("whatsapp.name")}: ${input.name ?? ""}`,
        `${t("whatsapp.phone")}: ${input.phone ?? ""}`,
        `${t("whatsapp.city")}: ${input.city ?? ""}`,
        `${t("whatsapp.address")}: ${input.address ?? ""}`,
        `${t("whatsapp.quantity")}: ${input.quantity ?? 1}`,
        `${t("whatsapp.note")}: ${input.note ?? ""}`,
      ].join("\n"),
    [t],
  );

  const orderLink = useCallback((input?: OrderMessage) => whatsappHref(orderMessage(input)), [orderMessage]);
  const askLink = useCallback(() => whatsappHref(t("whatsapp.ask")), [t]);

  return { orderMessage, orderLink, askLink };
}