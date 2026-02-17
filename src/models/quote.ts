import { LotRClient } from "../client";
import { ListParams } from "../schemas";
import {
  Quote as IQuote,
  QuoteKey,
  QuoteKeySchema,
  QuoteListResponse,
  QuoteListResponseSchema,
} from "../schemas/quote";
import { BaseModel } from "./base";

export class Quote extends BaseModel<IQuote, QuoteKey, QuoteListResponse> {
  protected baseEndpoint = "quote";
  protected keySchema = QuoteKeySchema;
  protected listResponseSchema = QuoteListResponseSchema;

  constructor(client: LotRClient) {
    super(client, "Quote");
  }

  async listQuotes(
    listParams?: ListParams<QuoteKey>,
  ): Promise<QuoteListResponse> {
    return this.list(listParams);
  }

  async getQuote(quoteId: string): Promise<IQuote> {
    return this.get(quoteId);
  }
}
