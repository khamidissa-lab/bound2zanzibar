"use client";

import { useActionState, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import { deleteContent } from "@/app/admin/_actions/content";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { initialFormState } from "@/lib/forms";

import { FormMessage } from "./form-controls";

/** Permanently deletes a content item after confirmation (admins only). */
export function DeleteButton({
  table,
  id,
  itemName,
}: {
  table: "tours" | "destinations" | "packages" | "blog_posts" | "tour_categories";
  id: string;
  itemName: string;
}) {
  const [state, action, pending] = useActionState(deleteContent, initialFormState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-2">
      <form ref={formRef} action={action}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={() => setOpen(true)}
        >
          <Trash2 aria-hidden="true" data-icon="inline-start" />
          {pending ? "Deleting…" : "Delete"}
        </Button>
      </form>
      <FormMessage state={state} />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{itemName}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes it and can&apos;t be undone. To hide it from the
              website but keep it, set the status to Archived instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setOpen(false);
                formRef.current?.requestSubmit();
              }}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
