"use client";

import { useActionState, useRef, useState } from "react";
import { Copy, Trash2 } from "lucide-react";

import { deleteMedia } from "@/app/admin/_actions/content";
import { FormMessage } from "@/components/admin/form-controls";
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

export function MediaItemActions({ path }: { path: string }) {
  const [state, action, pending] = useActionState(deleteMedia, initialFormState);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Copy path ${path}`}
          onClick={async () => {
            await navigator.clipboard.writeText(path);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          <Copy aria-hidden="true" />
        </Button>
        <form ref={formRef} action={action}>
          <input type="hidden" name="path" value={path} />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${path}`}
            disabled={pending}
            onClick={() => setOpen(true)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </form>
        {copied ? (
          <span role="status" className="self-center text-xs text-muted-foreground">
            Copied
          </span>
        ) : null}
      </div>
      {state.status === "error" ? <FormMessage state={state} /> : null}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              {path} will be removed permanently. Any tour, destination or article still
              using it will fall back to the placeholder illustration.
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
              Delete image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
