import { notFound } from "next/navigation";

/** Any unknown public URL renders this language's 404 page. */
export default function CatchAll() {
  notFound();
}
