import { LotRClient } from "../client";
import { ListParams, toParams } from "../schemas";
import {
  IMovie,
  MovieKey,
  MovieKeySchema,
  MovieListResponse,
  MovieListResponseSchema,
} from "../schemas/movie";
import {
  QuoteKeySchema,
  QuoteListResponse,
  QuoteListResponseSchema,
} from "../schemas/quote";
import { BaseModel } from "./base";

export class Movie extends BaseModel<IMovie, MovieKey, MovieListResponse> {
  protected baseEndpoint = "movie";
  protected keySchema = MovieKeySchema;
  protected listResponseSchema = MovieListResponseSchema;

  constructor(client: LotRClient) {
    super(client, "Movie");
  }

  async listMovies(listParams?: ListParams<MovieKey>): Promise<MovieListResponse> {
    return this.list(listParams);
  }

  async getMovie(movieId: string): Promise<IMovie> {
    return this.get(movieId);
  }

  async listQuotes(
    movieId: string,
    listParams?: ListParams,
  ): Promise<QuoteListResponse> {
    this.log.info({ movieId, listParams }, "Listing movie quotes");
    const listResponse = await this.client.get(
      `${this.baseEndpoint}/${movieId}/quote`,
      listParams ? toParams(listParams, QuoteKeySchema) : [],
    );
    const response = QuoteListResponseSchema.parse(listResponse);
    this.log.info({ total: response.total }, "Movie quotes listed");
    return response;
  }
}
