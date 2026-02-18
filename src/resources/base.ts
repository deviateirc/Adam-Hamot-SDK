import { z } from "zod";
import { LotRClient, logger } from "../client";
import { KeyMap, ListParams, toParams } from "../schemas";

export abstract class BaseResource<
  TDoc,
  TKey extends string,
  TListResponse extends { docs: TDoc[]; total: number },
> {
  protected abstract baseEndpoint: string;
  protected abstract keySchema: z.ZodType<TKey>;
  protected abstract listResponseSchema: z.ZodType<TListResponse>;
  protected abstract keyMap: KeyMap<TKey>;

  protected log;

  constructor(
    protected client: LotRClient,
    moduleName: string,
  ) {
    this.log = logger.child({ module: moduleName });
  }

  protected async list(listParams?: ListParams<TKey>): Promise<TListResponse> {
    this.log.info({ listParams }, "Listing");
    const listResponse = await this.client.get(
      this.baseEndpoint,
      listParams ? toParams(listParams, this.keySchema, this.keyMap) : [],
    );
    const response = this.listResponseSchema.parse(listResponse);
    this.log.info({ total: response.total }, "Listed");
    return response;
  }

  protected async get(id: string): Promise<TDoc> {
    this.log.info({ id }, "Getting");
    const rawResponse = await this.client.get(`${this.baseEndpoint}/${id}`);
    const response = this.listResponseSchema.parse(rawResponse);
    const doc = response.docs[0];
    if (!doc) {
      throw new Error(`${this.baseEndpoint}/${id} not found`);
    }
    return doc;
  }
}
