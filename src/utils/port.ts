import { z } from "zod";

const portSchema = z.number().int().min(1).max(65535);

export function parsePortInput(input: string | number): number {
  const raw = typeof input === "number" ? input : Number(input);
  const parsed = portSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Port must be an integer between 1 and 65535.");
  }

  return parsed.data;
}
