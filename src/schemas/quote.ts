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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export const QuoteKeyMap: Partial<Record<QuoteKey, string>> = {
  quoteId: "id",
  movieId: "movie",
  characterId: "character",
};

export type Quote = z.output<typeof QuoteSchema>;

export const QuoteListResponseSchema = ResponseSchema.extend(
  z.object({ docs: z.array(QuoteSchema) }).shape,
);
