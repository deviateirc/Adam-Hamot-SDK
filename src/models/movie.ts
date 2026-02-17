import { LotRClient, logger } from "../client";
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
      listParams ? toParams(listParams, QuoteKeySchema) : [],
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
