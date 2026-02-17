import { describe, it, mock, type Mock, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LotRClient } from "../src/client";
import { Movie } from "../src/models/movie";

const movieFixture = JSON.parse(
  readFileSync(join(__dirname, "fixtures/movie.json"), "utf-8"),
);

const quoteFixture = JSON.parse(
  readFileSync(join(__dirname, "fixtures/quote.json"), "utf-8"),
);

function createMockClient(response: unknown): LotRClient {
  const client = Object.create(LotRClient.prototype) as LotRClient;
  mock.method(client, "get", async () => response);
  return client;
}

describe("Movie", () => {
  let movie: Movie;

  describe("listMovies", () => {
    beforeEach(() => {
      movie = new Movie(createMockClient(movieFixture));
    });

    it("returns all movies with correct total", async () => {
      const result = await movie.listMovies();
      assert.equal(result.total, 8);
      assert.equal(result.docs.length, 8);
    });

    it("transforms _id to movieId", async () => {
      const result = await movie.listMovies();
      const fellowship = result.docs.find(
        (m) => m.name === "The Fellowship of the Ring",
      );
      assert.ok(fellowship);
      assert.equal(fellowship.movieId, "5cd95395de30eff6ebccde5c");
      assert.equal("_id" in fellowship, false);
    });

    it("parses all movie fields correctly", async () => {
      const result = await movie.listMovies();
      const rotk = result.docs.find((m) => m.name === "The Return of the King");
      assert.ok(rotk);
      assert.equal(rotk.runtimeInMinutes, 201);
      assert.equal(rotk.budgetInMillions, 94);
      assert.equal(rotk.boxOfficeRevenueInMillions, 1120);
      assert.equal(rotk.academyAwardNominations, 11);
      assert.equal(rotk.academyAwardWins, 11);
      assert.equal(rotk.rottenTomatoesScore, 95);
    });

    it("includes pagination metadata", async () => {
      const result = await movie.listMovies();
      assert.equal(result.limit, 1000);
      assert.equal(result.page, 1);
      assert.equal(result.pages, 1);
      assert.equal(result.offset, 0);
    });

    it("passes list params to client", async () => {
      const mockClient = createMockClient(movieFixture);
      movie = new Movie(mockClient);

      await movie.listMovies({
        sort: { key: "name", order: "asc" },
        pagination: { limit: 5, page: 2 },
      });

      const getCall = (mockClient.get as unknown as Mock<(...args: unknown[]) => unknown>).mock
        .calls[0];
      assert.equal(getCall.arguments[0], "movie");
      const params = getCall.arguments[1] as string[];
      assert.ok(params.includes("sort=name:asc"));
      assert.ok(params.includes("limit=5"));
      assert.ok(params.includes("page=2"));
    });
  });

  describe("getMovie", () => {
    it("returns a single movie by id", async () => {
      const singleMovieResponse = {
        ...movieFixture,
        docs: [movieFixture.docs[6]], // Fellowship
        total: 1,
      };
      movie = new Movie(createMockClient(singleMovieResponse));

      const result = await movie.getMovie("5cd95395de30eff6ebccde5c");
      assert.equal(result.name, "The Fellowship of the Ring");
      assert.equal(result.movieId, "5cd95395de30eff6ebccde5c");
    });

    it("calls client with correct endpoint", async () => {
      const singleMovieResponse = {
        ...movieFixture,
        docs: [movieFixture.docs[0]],
        total: 1,
      };
      const mockClient = createMockClient(singleMovieResponse);
      movie = new Movie(mockClient);

      await movie.getMovie("5cd95395de30eff6ebccde5c");

      const getCall = (mockClient.get as unknown as Mock<(...args: unknown[]) => unknown>).mock
        .calls[0];
      assert.equal(getCall.arguments[0], "movie/5cd95395de30eff6ebccde5c");
    });
  });

  describe("listQuotes", () => {
    beforeEach(() => {
      movie = new Movie(createMockClient(quoteFixture));
    });

    it("returns quotes for a movie", async () => {
      const result = await movie.listQuotes("5cd95395de30eff6ebccde5d");
      assert.equal(result.total, quoteFixture.total);
      assert.ok(result.docs.length > 0);
    });

    it("transforms quote fields correctly", async () => {
      const result = await movie.listQuotes("5cd95395de30eff6ebccde5d");
      const firstQuote = result.docs[0];
      assert.equal(firstQuote.quoteId, "5cd96e05de30eff6ebcce7e9");
      assert.equal(firstQuote.movieId, "5cd95395de30eff6ebccde5d");
      assert.equal(firstQuote.characterId, "5cd99d4bde30eff6ebccfe9e");
      assert.equal(firstQuote.dialog, "Deagol!!");
    });

    it("calls client with correct endpoint", async () => {
      const mockClient = createMockClient(quoteFixture);
      movie = new Movie(mockClient);

      await movie.listQuotes("5cd95395de30eff6ebccde5d");

      const getCall = (mockClient.get as unknown as Mock<(...args: unknown[]) => unknown>).mock
        .calls[0];
      assert.equal(
        getCall.arguments[0],
        "movie/5cd95395de30eff6ebccde5d/quote",
      );
    });
  });
});
