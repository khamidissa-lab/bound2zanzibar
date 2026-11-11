"use server";

import { refresh, updateTag } from "next/cache";

import { authorizeAction } from "@/lib/auth/session";
import { formValues, type FormState } from "@/lib/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fieldErrors } from "@/lib/validation/auth";
import { currencySchema } from "@/lib/validation/settings";
import { CONTENT_TAG } from "@/services/content-db";

/**
 * Adds a currency or updates one. Codes can't be changed once added (prices
 * and bookings refer to them), and nothing is ever converted between them.
 * A currency still used by active prices can't be switched off, because
 * visitors could then no longer book those prices.
 */
export async function saveCurrency(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeAction("settings.manage");
  if (!auth.ok) return { status: "error", message: auth.message };

  const values = formValues(formData);
  const existing = values.existing ?? "";
  const parsed = currencySchema.safeParse({ ...values, code: existing || values.code });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }
  const v = parsed.data;
  const supabase = await createSupabaseServerClient();

  if (existing && !v.isActive) {
    const [tours, packages, options, active] = await Promise.all([
      supabase
        .from("tour_prices")
        .select("id", { count: "exact", head: true })
        .eq("currency", v.code)
        .eq("is_active", true),
      supabase
        .from("package_prices")
        .select("id", { count: "exact", head: true })
        .eq("currency", v.code)
        .eq("is_active", true),
      supabase
        .from("tour_option_prices")
        .select("id", { count: "exact", head: true })
        .eq("currency", v.code),
      supabase
        .from("currencies")
        .select("code", { count: "exact", head: true })
        .eq("is_active", true)
        .neq("code", v.code),
    ]);
    const firstError = tours.error ?? packages.error ?? options.error ?? active.error;
    if (firstError) {
      console.error(`[settings] currency check failed: ${firstError.message}`);
      return {
        status: "error",
        message: "We couldn't save your changes. Please try again.",
      };
    }
    const inUse = (tours.count ?? 0) + (packages.count ?? 0) + (options.count ?? 0);
    if (inUse > 0) {
      return {
        status: "error",
        message: `${v.code} is still used by ${inUse} active ${inUse === 1 ? "price" : "prices"}. Remove or switch off those prices first (see Pricing).`,
      };
    }
    if ((active.count ?? 0) === 0) {
      return { status: "error", message: "At least one currency must stay active." };
    }
  }

  const row = { name: v.name, sort_order: v.sortOrder, is_active: v.isActive };
  const { error } = existing
    ? await supabase.from("currencies").update(row).eq("code", v.code)
    : await supabase.from("currencies").insert({ code: v.code, ...row });
  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: `${v.code} is already in the list.`,
        fieldErrors: { code: "Already added." },
      };
    }
    if (error.code === "42501" || /row-level security/i.test(error.message)) {
      return { status: "error", message: "You don't have permission to do that." };
    }
    console.error(
      `[settings] currency save failed: ${error.code ?? ""} ${error.message}`,
    );
    return {
      status: "error",
      message: "We couldn't save your changes. Please try again.",
    };
  }

  // Price editors and the booking form list the active currencies.
  updateTag(CONTENT_TAG);
  refresh();
  return {
    status: "success",
    message: existing ? "Currency saved." : `${v.code} added.`,
  };
}
