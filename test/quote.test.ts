import { describe, it, mock, type Mock, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LotRClient } from "../src/client";
import { Quote } from "../src/resources/quote";

const quoteFixture = JSON.parse(
  readFileSync(join(__dirname, "fixtures/quote.json"), "utf-8"),
);

function createMockClient(response: unknown): LotRClient {
  const client = Object.create(LotRClient.prototype) as LotRClient;
  mock.method(client, "get", async () => response);
  return client;
}

describe("Quote", () => {
  let quote: Quote;

  describe("listQuotes", () => {
    beforeEach(() => {
      quote = new Quote(createMockClient(quoteFixture));
    });

    it("returns all quotes with correct total", async () => {
      const result = await quote.listQuotes();
      assert.equal(result.total, quoteFixture.total);
      assert.equal(result.docs.length, quoteFixture.docs.length);
    });

    it("transforms _id/movie/character/id fields correctly", async () => {
      const result = await quote.listQuotes();
      const first = result.docs[0];

      // _id and id both become quoteId (using id field)
      assert.equal(first.quoteId, "5cd96e05de30eff6ebcce7e9");
      // movie becomes movieId
      assert.equal(first.movieId, "5cd95395de30eff6ebccde5d");
      // character becomes characterId
      assert.equal(first.characterId, "5cd99d4bde30eff6ebccfe9e");
      // dialog is preserved
      assert.equal(first.dialog, "Deagol!!");

      // Raw fields should not be present
      assert.equal("_id" in first, false);
      assert.equal("movie" in first, false);
      assert.equal("character" in first, false);
      assert.equal("id" in first, false);
    });

    it("includes pagination metadata", async () => {
      const result = await quote.listQuotes();
      assert.equal(result.limit, quoteFixture.limit);
      assert.equal(result.page, quoteFixture.page);
      assert.equal(result.pages, quoteFixture.pages);
    });

    it("passes filter params to client", async () => {
      const mockClient = createMockClient(quoteFixture);
      quote = new Quote(mockClient);

      await quote.listQuotes({
        filters: [
          {
            key: "movieId",
            value: { eq: "5cd95395de30eff6ebccde5d" },
          },
        ],
      });

      const getCall = (
        mockClient.get as unknown as Mock<(...args: unknown[]) => unknown>
      ).mock.calls[0];
      assert.equal(getCall.arguments[0], "quote");
      const params = getCall.arguments[1] as string[];
      assert.ok(
        params.includes("movie=5cd95395de30eff6ebccde5d"),
        `expected movie= param, got: ${params}`,
      );
    });

    it("passes sort params to client", async () => {
      const mockClient = createMockClient(quoteFixture);
      quote = new Quote(mockClient);

      await quote.listQuotes({
        sort: { key: "dialog", order: "asc" },
      });

      const getCall = (
        mockClient.get as unknown as Mock<(...args: unknown[]) => unknown>
      ).mock.calls[0];
      const params = getCall.arguments[1] as string[];
      assert.ok(params.includes("sort=dialog:asc"));
    });
  });

  describe("getQuote", () => {
    it("returns a single quote by id", async () => {
      const singleQuoteResponse = {
        ...quoteFixture,
        docs: [quoteFixture.docs[0]],
        total: 1,
      };
      quote = new Quote(createMockClient(singleQuoteResponse));

      const result = await quote.getQuote("5cd96e05de30eff6ebcce7e9");
      assert.equal(result.quoteId, "5cd96e05de30eff6ebcce7e9");
      assert.equal(result.dialog, "Deagol!!");
      assert.equal(result.movieId, "5cd95395de30eff6ebccde5d");
      assert.equal(result.characterId, "5cd99d4bde30eff6ebccfe9e");
    });

    it("calls client with correct endpoint", async () => {
      const singleQuoteResponse = {
        ...quoteFixture,
        docs: [quoteFixture.docs[0]],
        total: 1,
      };
      const mockClient = createMockClient(singleQuoteResponse);
      quote = new Quote(mockClient);

      await quote.getQuote("5cd96e05de30eff6ebcce7e9");

      const getCall = (
        mockClient.get as unknown as Mock<(...args: unknown[]) => unknown>
      ).mock.calls[0];
      assert.equal(getCall.arguments[0], "quote/5cd96e05de30eff6ebcce7e9");
    });
  });

  describe("quote data integrity", () => {
    beforeEach(() => {
      quote = new Quote(createMockClient(quoteFixture));
    });

    it("all quotes have required fields", async () => {
      const result = await quote.listQuotes();
      for (const q of result.docs) {
        assert.ok(q.quoteId, "quoteId should be present");
        assert.ok(q.movieId, "movieId should be present");
        assert.ok(q.characterId, "characterId should be present");
        assert.equal(typeof q.dialog, "string", "dialog should be a string");
      }
    });

    it("all quotes reference valid movie ids", async () => {
      const result = await quote.listQuotes();
      for (const q of result.docs) {
        assert.match(
          q.movieId,
          /^[a-f0-9]{24}$/,
          `movieId should be a 24-char hex string, got: ${q.movieId}`,
        );
      }
    });
  });
});
