import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="admin-scope flex flex-1 flex-col items-center justify-center gap-4 px-5 py-20 text-center">
      <h1 className="text-3xl text-ocean-deep">Page not found</h1>
      <p className="text-muted-foreground">This admin page doesn&apos;t exist.</p>
      <Link href="/admin" className="text-turquoise-deep underline underline-offset-2">
        Back to the dashboard
      </Link>
    </main>
  );
}
