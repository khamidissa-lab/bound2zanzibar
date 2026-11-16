"use client";

import { useEffect, useRef } from "react";

import type { FormState } from "@/lib/forms";

/**
 * After a submit comes back with errors, moves keyboard focus to the first
 * field marked invalid (or the form's alert when no field is), so keyboard
 * and screen-reader users land on what needs fixing. Attach the returned ref
 * to the <form>.
 */
export function useFocusFirstError(state: FormState) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status !== "error") return;
    const form = formRef.current;
    if (!form) return;
    const target =
      form.querySelector<HTMLElement>("[aria-invalid='true']") ??
      form.querySelector<HTMLElement>("[role='alert']");
    if (!target) return;
    if (target.getAttribute("role") === "alert" && !target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }
    target.focus();
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [state]);
  return formRef;
}
