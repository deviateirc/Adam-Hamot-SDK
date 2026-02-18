import { LotRClient } from "../client";
import { ListParams, toParams } from "../schemas";
import {
  IMovie,
  MovieKey,
  MovieKeyMap,
  MovieKeySchema,
  MovieListResponse,
  MovieListResponseSchema,
} from "../schemas/movie";
import {
  QuoteKey,
  QuoteKeyMap,
  QuoteKeySchema,
  QuoteListResponse,
  QuoteListResponseSchema,
} from "../schemas/quote";
import { BaseResource } from "./base";

/**
 * Provides access to movie data from The One API.
 */
export class Movie extends BaseResource<IMovie, MovieKey, MovieListResponse> {
  protected baseEndpoint = "movie";
  protected keySchema = MovieKeySchema;
  protected listResponseSchema = MovieListResponseSchema;
  protected keyMap = MovieKeyMap;

  constructor(client: LotRClient) {
    super(client, "Movie");
  }

  /**
   * Lists movies with optional sorting, filtering, and pagination.
   * @param listParams - Optional parameters for sorting, filtering, and pagination.
   */
  async listMovies(
    listParams?: ListParams<MovieKey>,
  ): Promise<MovieListResponse> {
    return this.list(listParams);
  }

  /**
   * Fetches a single movie by its ID.
   * @param movieId - The movie's unique identifier.
   */
  async getMovie(movieId: string): Promise<IMovie> {
    return this.get(movieId);
  }

  /**
   * Lists quotes for a specific movie with optional sorting, filtering, and pagination.
   * @param movieId - The movie's unique identifier.
   * @param listParams - Optional parameters for sorting, filtering, and pagination.
   */
  async listQuotes(
    movieId: string,
    listParams?: ListParams<QuoteKey>,
  ): Promise<QuoteListResponse> {
    this.log.info({ movieId, listParams }, "Listing movie quotes");
    const listResponse = await this.client.get(
      `${this.baseEndpoint}/${movieId}/quote`,
      listParams ? toParams(listParams, QuoteKeySchema, QuoteKeyMap) : [],
    );
    const response = QuoteListResponseSchema.parse(listResponse);
    this.log.info({ total: response.total }, "Movie quotes listed");
    return response;
  }
}
