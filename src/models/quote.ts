import { LotRClient, logger } from "../client";
import { ListParams, toParams } from "../schemas";
import {
  Quote as IQuote,
  QuoteKey,
  QuoteKeySchema,
  QuoteListResponse,
  QuoteListResponseSchema,
} from "../schemas/quote";

export class Quote {
  protected baseEndpoint = "quote";
  private log = logger.child({ module: "Quote" });

  constructor(private client: LotRClient) {}

  async listQuotes(
    listParams?: ListParams<QuoteKey>,
  ): Promise<QuoteListResponse> {
    this.log.info({ listParams }, "Listing quotes");
    const listResponse = await this.client.get(
      this.baseEndpoint,
      listParams ? toParams(listParams, QuoteKeySchema) : [],
    );
    const response = QuoteListResponseSchema.parse(listResponse);
    this.log.info({ total: response.total }, "Quotes listed");
    return response;
  }

  async getQuote(quoteId: string): Promise<IQuote> {
    this.log.info({ quoteId }, "Getting quote");
    const rawResponse = await this.client.get(
      `${this.baseEndpoint}/${quoteId}`,
    );
    const response = QuoteListResponseSchema.parse(rawResponse);
    return response.docs[0];
  }
}
