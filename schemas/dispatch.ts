import * as z from "zod";

// ---------- Schéma pro VÝSLEDEK dispatche ----------
export const DispatchResultSchema = z.object({
  success: z.boolean(),
  courier_id: z.number().int().positive().optional(),
  message: z.string().optional(),
});

// ---------- Odvozený TypeScript typ ----------
export type DispatchResult = z.infer<typeof DispatchResultSchema>;
