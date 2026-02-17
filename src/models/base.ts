import { z } from "zod";
import { LotRClient, logger } from "../client";
import { ListParams, toParams } from "../schemas";

export abstract class BaseModel<TDoc, TKey extends string, TListResponse> {
  protected abstract baseEndpoint: string;
  protected abstract keySchema: z.ZodType<TKey>;
  protected abstract listResponseSchema: z.ZodType<TListResponse>;

  protected log;

  constructor(
    protected client: LotRClient,
    moduleName: string,
  ) {
    this.log = logger.child({ module: moduleName });
  }

  async list(listParams?: ListParams<TKey>): Promise<TListResponse> {
    this.log.info({ listParams }, "Listing");
    const listResponse = await this.client.get(
      this.baseEndpoint,
      listParams ? toParams(listParams, this.keySchema) : [],
    );
    const response = this.listResponseSchema.parse(listResponse);
    this.log.info({ total: (response as any).total }, "Listed");
    return response;
  }

  async get(id: string): Promise<TDoc> {
    this.log.info({ id }, "Getting");
    const rawResponse = await this.client.get(
      `${this.baseEndpoint}/${id}`,
    );
    const response = this.listResponseSchema.parse(rawResponse);
    return (response as any).docs[0];
  }
}
