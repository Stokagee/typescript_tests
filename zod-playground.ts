import * as z from "zod";

const PingSchema = z.object({
  message: z.string(),
  timestamp: z.number().int().positive(),
});

const valid = { message: "vrať tyto data", timestamp: 17 };
const invalid = { message: "1", timestamp: "not a number" };

console.log("Valid parse:", PingSchema.parse(valid));

const safe = PingSchema.safeParse(invalid);
if (!safe.success) {
  console.log("Invalid - errors:");
  console.log(z.prettifyError(safe.error));
}
