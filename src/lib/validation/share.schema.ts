import { z } from "zod";

export const unlockShareSchema = z.object({
  accessKey: z
    .string()
    .trim()
    .min(4, "Access key must be at least 4 characters")
    .max(32, "Access key must not exceed 32 characters"),
});

export type UnlockShareInput = z.infer<typeof unlockShareSchema>;
