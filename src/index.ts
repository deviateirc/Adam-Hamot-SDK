import { z } from "zod";

export const ResponseSchema = z.object({
  docs: z.array(z.object()),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  page: z.number(),
  pages: z.number(),
});
