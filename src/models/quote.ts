import { LotRClient } from "../client";
import { ListParams } from "../schemas";
import {
  Quote as IQuote,
  QuoteKey,
  QuoteKeyMap,
  QuoteKeySchema,
  QuoteListResponse,
  QuoteListResponseSchema,
} from "../schemas/quote";
import { BaseModel } from "./base";

/**
 * Provides access to quote data from The One API.
 */
export class Quote extends BaseModel<IQuote, QuoteKey, QuoteListResponse> {
  protected baseEndpoint = "quote";
  protected keySchema = QuoteKeySchema;
  protected listResponseSchema = QuoteListResponseSchema;
  protected keyMap = QuoteKeyMap;

  constructor(client: LotRClient) {
    super(client, "Quote");
  }

  /**
   * Lists quotes with optional sorting, filtering, and pagination.
   * @param listParams - Optional parameters for sorting, filtering, and pagination.
   */
  async listQuotes(
    listParams?: ListParams<QuoteKey>,
  ): Promise<QuoteListResponse> {
    return this.list(listParams);
  }

  /**
   * Fetches a single quote by its ID.
   * @param quoteId - The quote's unique identifier.
   */
  async getQuote(quoteId: string): Promise<IQuote> {
    return this.get(quoteId);
  }
}
