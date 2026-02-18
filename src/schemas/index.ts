import { z } from "zod";

export const ResponseSchema = z.object({
  docs: z.array(z.object()),
  total: z.number(),
  limit: z.number(),
  offset: z.number().optional(),
  page: z.number().optional(),
  pages: z.number().optional(),
});

type PaginationParams = {
  limit?: number; // default 10
  page?: number;
  offset?: number;
};

const FilterValueSchema = z.union([
  z.object({ eq: z.string() }).strict(),
  z.object({ ne: z.string() }).strict(),
  z.object({ include: z.array(z.string()) }).strict(),
  z.object({ exclude: z.array(z.string()) }).strict(),
  z.object({ exists: z.literal(true) }).strict(),
  z.object({ notExists: z.literal(true) }).strict(),
  z
    .object({
      regex: z.object({ pattern: z.string(), flags: z.string().optional() }),
    })
    .strict(),
  z.object({ lt: z.number() }).strict(),
  z.object({ lte: z.number() }).strict(),
  z.object({ gt: z.number() }).strict(),
  z.object({ gte: z.number() }).strict(),
]);

export type FilterValue = z.input<typeof FilterValueSchema>;

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
      value: FilterValueSchema,
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
        case "regex": {
          const { pattern, flags } = filterValue as {
            pattern: string;
            flags?: string;
          };
          const regex = new RegExp(pattern, flags);
          return `${key}=${regex}`;
        }
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
  filters?: { key: K; value: FilterValue }[];

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
