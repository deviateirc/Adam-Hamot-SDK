import { z } from "zod";

export type QuoteListResponse = z.output<typeof QuoteListResponseSchema>;

import { ResponseSchema } from "../schemas";

export const QuoteSchema = z
  .object({
    // quoteId
    _id: z.string(),

    dialog: z.string(),
    // movieId
    movie: z.string(),
    // characterId
    character: z.string(),

    // quoteId
    id: z.string(),
  })
  .transform(({ _id, movie, character, id, ...rest }) => ({
    quoteId: id,
    movieId: movie,
    characterId: character,
    ...rest,
  }));

export const QuoteKeySchema = z.enum([
  "movieId",
  "quoteId",
  "characterId",
  "dialog",
]);

export type QuoteKey = z.infer<typeof QuoteKeySchema>;

export type Quote = z.output<typeof QuoteSchema>;

export const QuoteListResponseSchema = ResponseSchema.extend(
  z.object({ docs: z.array(QuoteSchema) }).shape,
);
