import { z } from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  content: z
    .string()
    .min(1, "Note content is required")
    .max(65536, "Note content must not exceed 65,536 characters"),
  expiresAt: z
    .string()
    .datetime({ message: "Invalid expiration date format" })
    .refine((val) => new Date(val).getTime() > Date.now(), {
      message: "Expiration date must be strictly in the future",
    }),
  shareType: z.enum(["ONE_TIME", "TIME_BASED"], {
    errorMap: () => ({ message: "Share type must be ONE_TIME or TIME_BASED" }),
  }),
  accessType: z.enum(["PUBLIC", "PASSWORD_PROTECTED"], {
    errorMap: () => ({ message: "Access type must be PUBLIC or PASSWORD_PROTECTED" }),
  }),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
