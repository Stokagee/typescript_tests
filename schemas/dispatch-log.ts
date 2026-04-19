import * as z from "zod";

// ---------- Schéma pro záznam dispatch logu ----------
// Defensivní: povinná jen ta pole, na která se v testech asertuje.
// Ostatní (id, created_at, reason, ...) jsou volitelná — API je může měnit bez rozbití testů.
export const DispatchLogSchema = z.object({
  order_id: z.number().int().positive(),
  // `type` není vždy přítomný (backend posílá event-level logy i bez něj) → volitelné
  type: z.string().min(1).optional(),
  courier_id: z.number().int().positive().nullable().optional(),
  id: z.number().int().positive().optional(),
  created_at: z.string().optional(),
});

export const DispatchLogListSchema = z.array(DispatchLogSchema);

export type DispatchLog = z.infer<typeof DispatchLogSchema>;
