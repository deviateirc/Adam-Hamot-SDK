import { z } from "zod";
import { ResponseSchema } from "../index";
import { LotRClient } from "../client";

const SortSchema = z
  .object({
    key: z.string(),
    order: z.literal("asc", "desc"),
  })
  .transform(({ key, order }) => `sort=${key}:${order}`);

type Sort = z.output<typeof SortSchema>;

type PaginationParams = {
  limit?: number; // default 10
  page?: number;
  offset?: number;
};

function exactlyOne<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).refine(
    (data) => {
      const filled = Object.values(data).filter((v) => v !== undefined);
      return filled.length === 1;
    },
    { message: "Exactly one field must be provided" },
  );
}

const FilterParamsSchema = z
  .object({
    key: z.string(),
    value: exactlyOne({
      eq: z.string().optional(),
      ne: z.string().optional(),
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      exists: z.string().optional(),
      notExists: z.string().optional(),
      // TODO: Figure out if need to be url encoded?
      regex: z.string().optional(),
      lt: z.number().optional(),
      lte: z.number().optional(),
      gt: z.number().optional(),
      gte: z.number().optional(),
    }),
  })
  .transform(({ key, value }) => {
    const [filterField, filterValue] = Object.entries(value).find(
      ([, v]) => v !== undefined,
    )!;

    switch (filterField) {
      case "eq":
        return `${key}=${filterValue}`;
      case "ne":
        return `${key}!=${filterValue}`;
      case "include":
        return `${key}=${(filterValue as string[]).join(",")}`;
      case "exclude":
        return `${key}!=${(filterValue as string[]).join(",")}`;
      case "exists":
        return `${key}`;
      case "notExists":
        return `!${key}`;
      case "regex":
        // TODO: Verify if i need this or need to wrap more
        const regex = new RegExp(filterValue as string);
        return `${key}=${regex.source}`;
      case "lt":
        return `${key}<${filterValue}`;
      case "lte":
        return `${key}<=${filterValue}`;
      case "gt":
        return `${key}>${filterValue}`;
      case "gte":
        return `${key}>=${filterValue}`;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  });

type FilterParams = z.output<typeof FilterParamsSchema>;

type ListParams = {
  pagination?: PaginationParams;
  filters?: FilterParams[];

  // Assumption: Can only sort by a single field at a time
  sort?: Sort;
};

export const MovieSchema = z
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

const MovieListResponseSchema = ResponseSchema.extend(
  z.object({ docs: z.array(MovieSchema) }).shape,
);

type MovieListResponse = z.output<typeof MovieListResponseSchema>;

export interface IMovie extends z.output<typeof MovieSchema> {}

export class Movie {
  protected baseEndpoint = "/movie";

  constructor(private client: LotRClient) {}

  async listMovies(listParams?: ListParams): Promise<MovieListResponse> {
    const listResponse = await this.client.get(this.baseEndpoint);
    const response = MovieListResponseSchema.parse(listResponse);
    return response;
  }

  async listQuotes(movieId: string, listParams?: ListParams) {}

  async getMovie(movieId: string) {}
}
