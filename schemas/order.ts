import * as z from "zod";

export const OrderStatusSchema = z.enum([
  "CREATED",
  "SEARCHING",
  "ASSIGNED",
  "PICKED",
  "DELIVERED",
  "CANCELLED",
]);

export const OrderCreateSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().min(9).max(20),
  pickup_address: z.string().min(3).max(200),
  pickup_lat: z.number().min(-90).max(90),
  pickup_lng: z.number().min(-180).max(180),
  delivery_address: z.string().min(3).max(200),
  delivery_lat: z.number().min(-90).max(90),
  delivery_lng: z.number().min(-180).max(180),
  is_vip: z.boolean().default(false),
  required_tags: z.array(z.string()).default([]),
});

export const OrderSchema = OrderCreateSchema.extend({
  id: z.number().int().positive(),
  status: OrderStatusSchema,
  created_at: z.iso.datetime(),
});

export const OrderListSchema = z.array(OrderSchema);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderCreate = z.infer<typeof OrderCreateSchema>;
export type Order = z.infer<typeof OrderSchema>;