import * as z from "zod";

// ---------- Schéma pro VÝSLEDEK dispatche ----------
export const DispatchResultSchema = z.object({
  success: z.boolean(),
  // při failure vrací backend explicitní null (nikoli undefined) → nullable + optional
  courier_id: z.number().int().positive().nullable().optional(),
  order_id: z.number().int().positive().optional(),
  message: z.string().optional(),
});

// ---------- Odvozený TypeScript typ ----------
export type DispatchResult = z.infer<typeof DispatchResultSchema>;
