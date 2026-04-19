import * as z from "zod";

// Custom email validation that allows international characters
const emailSchema = z.string().refine(
  (email) => {
    // Basic email regex that allows unicode characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
    return emailRegex.test(email);
  },
  { message: "Invalid email address" }
);

// ---------- Schéma pro VYTVOŘENÍ kurýra (request body) ----------
export const CourierCreateSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(9).max(20),
  email: emailSchema,
  tags: z.array(z.string()).default([]),
});

// ---------- Schéma pro RESPONSE z API ----------
export const CourierSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  phone: z.string(),
  email: emailSchema,
  tags: z.array(z.string()),
  status: z.enum(["offline", "available", "busy"]),
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
});

// ---------- Schéma pro LIST endpoint ----------
export const CourierListSchema = z.array(CourierSchema);

// ---------- Odvozené TypeScript typy ----------
export type CourierCreate = z.infer<typeof CourierCreateSchema>;
export type Courier = z.infer<typeof CourierSchema>;
