import { z } from "zod";
import { LotRClient, logger } from "../client";
import { ListParams, ResponseSchema, toParams } from "../schemas";
import { QuoteSchema } from "./quote";

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

const MovieKeySchema = z.enum([
  "movieId",
  "name",
  "runtimeInMinutes",
  "budgetInMillions",
  "boxOfficeRevenueInMillions",
  "academyAwardNominations",
  "academyAwardWins",
  "rottenTomatoesScore",
]);

export type MovieKey = z.infer<typeof MovieKeySchema>;

const MovieListResponseSchema = ResponseSchema.extend(
  z.object({ docs: z.array(MovieSchema) }).shape,
);

type MovieListResponse = z.output<typeof MovieListResponseSchema>;

const QuoteListResponseSchema = ResponseSchema.extend(
  z.object({ docs: z.array(QuoteSchema) }).shape,
);

type QuoteListResponse = z.output<typeof QuoteListResponseSchema>;

export interface IMovie extends z.output<typeof MovieSchema> {}

export class Movie {
  protected baseEndpoint = "movie";
  private log = logger.child({ module: "Movie" });

  constructor(private client: LotRClient) {}

  async listMovies(
    listParams?: ListParams<MovieKey>,
  ): Promise<MovieListResponse> {
    this.log.info({ listParams }, "Listing movies");
    const listResponse = await this.client.get(
      this.baseEndpoint,
      listParams ? toParams(listParams, MovieKeySchema) : [],
    );
    const response = MovieListResponseSchema.parse(listResponse);
    this.log.info({ total: response.total }, "Movies listed");
    return response;
  }

  async listQuotes(
    movieId: string,
    listParams?: ListParams,
  ): Promise<QuoteListResponse> {
    this.log.info({ movieId, listParams }, "Listing movie quotes");
    const listResponse = await this.client.get(
      `${this.baseEndpoint}/${movieId}/quote`,
      listParams ? toParams(listParams, z.string()) : [],
    );
    const response = QuoteListResponseSchema.parse(listResponse);
    this.log.info({ total: response.total }, "Movie quotes listed");
    return response;
  }

  async getMovie(movieId: string): Promise<IMovie> {
    this.log.info({ movieId }, "Getting movie");
    const rawResponse = await this.client.get(
      `${this.baseEndpoint}/${movieId}`,
    );
    const response = MovieListResponseSchema.parse(rawResponse);
    return response.docs[0];
  }
}
