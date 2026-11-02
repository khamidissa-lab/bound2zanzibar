import { z } from "zod";

export const ASSISTANT_LIMITS = {
  maxMessages: 20,
  maxMessageChars: 1500,
  maxTotalChars: 12000,
} as const;

const message = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(ASSISTANT_LIMITS.maxMessageChars),
});

/**
 * A visitor conversation: alternating turns that start and end with the
 * visitor, within size limits that keep the public endpoint's cost bounded.
 */
export const assistantRequestSchema = z.object({
  messages: z
    .array(message)
    .min(1)
    .max(ASSISTANT_LIMITS.maxMessages)
    .refine(
      (msgs) => msgs.every((m, i) => m.role === (i % 2 === 0 ? "user" : "assistant")),
      "Messages must alternate, starting with the visitor.",
    )
    .refine(
      (msgs) => msgs.at(-1)?.role === "user",
      "The last message must be the visitor's.",
    )
    .refine(
      (msgs) =>
        msgs.reduce((n, m) => n + m.content.length, 0) <= ASSISTANT_LIMITS.maxTotalChars,
      "The conversation is too long.",
    ),
  /** Site path the visitor is on, so "this tour" can be resolved. */
  page: z
    .string()
    .max(200)
    .regex(/^\/[a-z0-9/-]*$/)
    .optional(),
});

export type AssistantMessage = z.infer<typeof message>;
