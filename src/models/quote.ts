import { z } from "zod";
import { ResponseSchema } from "../schemas";

export const QuoteSchema = z.object({
  // quoteId
  _id: z.string(),

  dialog: z.string(),
  // movieId
  movie: z.string(),
  // characterId
  character: z.string(),
  // quoteId
  id: z.string(),
});

export type Quote = z.output<typeof QuoteSchema>;

const QuoteListResponseSchema = ResponseSchema.extend(
  z.object({ docs: z.array(QuoteSchema) }).shape,
);
