import { z } from "zod";
import { ResponseSchema } from "./index";

const MovieSchema = z
  .object({
    _id: z.string(),

    name: z.string(),
    runtimeInMinutes: z.number(),
    budgetInMillions: z.number(),
    boxOfficeRevenueInMillions: z.number(),
    academyAwardNominations: z.number(),
    academyAwardWins: z.number(),
    rottenTomatoesScore: z.number(),
  })
  .transform(({ _id, ...rest }) => ({
    movieId: _id,
    ...rest,
  }));

export const MovieKeySchema = z.enum([
  "movieId",
  "name",
  "runtimeInMinutes",
  "budgetInMillions",
  "boxOfficeRevenueInMillions",
  "academyAwardNominations",
  "academyAwardWins",
  "rottenTomatoesScore",
]);

export type IMovie = z.output<typeof MovieSchema>;

export type MovieKey = z.infer<typeof MovieKeySchema>;

export const MovieListResponseSchema = ResponseSchema.extend(
  z.object({ docs: z.array(MovieSchema) }).shape,
);

export type MovieListResponse = z.output<typeof MovieListResponseSchema>;
