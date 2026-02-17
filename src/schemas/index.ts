import { z } from "zod";

export const ResponseSchema = z.object({
  docs: z.array(z.object()),
  total: z.number(),
  limit: z.number(),
  offset: z.number().optional(),
  page: z.number(),
  pages: z.number(),
});

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

function createSortSchema(keySchema: z.ZodType<string>) {
  return z
    .object({
      key: keySchema,
      order: z.literal("asc", "desc"),
    })
    .transform((data) => `sort=${data.key}:${data.order}`);
}

function createFilterParamsSchema(keySchema: z.ZodType<string>) {
  return z
    .object({
      key: keySchema,
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
    .transform((data) => {
      const key = data.key as string;
      const [filterField, filterValue] = Object.entries(data.value).find(
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
}

export type ListParams<K extends string = string> = {
  pagination?: PaginationParams;
  filters?: { key: K; value: z.input<ReturnType<typeof exactlyOne>> }[];

  // Assumption: Can only sort by a single field at a time
  sort?: { key: K; order: "asc" | "desc" };
};

export function toParams<K extends string>(
  listParams: ListParams<K>,
  keySchema: z.ZodType<K>,
): string[] {
  const sortSchema = createSortSchema(keySchema);
  const filterParamsSchema = createFilterParamsSchema(keySchema);

  const filters =
    listParams.filters?.map((f) => filterParamsSchema.parse(f)) || [];
  const params = [...filters];
  if (listParams.sort) {
    params.push(sortSchema.parse(listParams.sort));
  }

  const pagination = listParams.pagination;
  if (pagination) {
    if (pagination.page) {
      params.push(`page=${pagination.page}`);
    }
    if (pagination.limit) {
      params.push(`limit=${pagination.limit}`);
    }
    if (pagination.offset) {
      params.push(`offset=${pagination.offset}`);
    }
  }
  return params;
}

