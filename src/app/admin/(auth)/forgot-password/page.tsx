import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-display text-2xl">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your staff email and we&apos;ll send you a link to choose a new password.
      </p>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm">
        <Link href="/admin/login" className="text-turquoise-deep hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
