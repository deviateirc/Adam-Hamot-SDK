import { LotRClient, logger } from "../client";
import { ListParams } from "../schemas";
import { QuoteKey } from "../schemas/quote";

export class Quote {
  protected baseEndpoint = "quote";
  private log = logger.child({ module: "Movie" });

  constructor(private client: LotRClient) {}

  // /quote
  async listQuotes(listParams?: ListParams<QuoteKey>) {}

  // /quote/{id}
  async getQuote(quoteId: string) {}
}
