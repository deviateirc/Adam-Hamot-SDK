import { Movie } from "./src/resources/movie";
import { Quote } from "./src/resources/quote";

import { LotRClient } from "./src/client";

async function getById(movieResource: Movie, quoteResource: Quote) {
  // Movie
  const fellowship = await movieResource.getMovie("5cd95395de30eff6ebccde5c");
  console.log(
    "Fellowship:",
    fellowship.name,
    `(${fellowship.runtimeInMinutes} min)`,
  );

  // Quote
  const singleQuote = await quoteResource.getQuote("5cd96e05de30eff6ebcce7e9");
  console.log(
    "Single quote:",
    singleQuote.dialog,
    "from movie:",
    singleQuote.movieId,
  );
}

async function listing(movieResource: Movie, quoteResource: Quote) {
  // Movie
  const allMovies = await movieResource.listMovies();
  console.log("All movies:", allMovies.total);

  // Quote
  const allQuotes = await quoteResource.listQuotes({
    pagination: { limit: 5 },
  });
  console.log(
    "Quotes (first 5):",
    allQuotes.docs.map((q) => q.dialog),
  );
}

async function sorting(movieResource: Movie, quoteResource: Quote) {
  // Movie: sort by name
  const moviesSortedByName = await movieResource.listMovies({
    sort: { key: "name", order: "asc" },
  });
  console.log(
    "Movies sorted by name:",
    moviesSortedByName.docs.map((m) => m.name),
  );

  // Quote: sort by dialog
  const sortedQuotes = await quoteResource.listQuotes({
    sort: { key: "dialog", order: "asc" },
    pagination: { limit: 5 },
  });
  console.log(
    "Quotes sorted by dialog:",
    sortedQuotes.docs.map((q) => q.dialog),
  );
}

async function filtering(movieResource: Movie, quoteResource: Quote) {
  // Movie: gt
  const bigBudgetMovies = await movieResource.listMovies({
    filters: [{ key: "budgetInMillions", value: { gt: 200 } }],
  });
  console.log(
    "Big budget movies (gt 200M):",
    bigBudgetMovies.docs.map((m) => m.name),
  );

  // Movie: gte
  const awardWinners = await movieResource.listMovies({
    filters: [{ key: "academyAwardWins", value: { gte: 4 } }],
  });
  console.log(
    "Award winners (gte 4):",
    awardWinners.docs.map((m) => m.name),
  );

  // Movie: lt
  const lowScoreMovies = await movieResource.listMovies({
    filters: [{ key: "rottenTomatoesScore", value: { lt: 70 } }],
  });
  console.log(
    "Low RT score movies (lt 70):",
    lowScoreMovies.docs.map((m) => m.name),
  );

  // Quote: eq
  const movieQuotes = await quoteResource.listQuotes({
    filters: [{ key: "movieId", value: { eq: "5cd95395de30eff6ebccde5c" } }],
    pagination: { limit: 5 },
  });
  console.log(
    "Fellowship quotes (eq):",
    movieQuotes.docs.map((q) => q.dialog),
  );

  // Quote: ne
  const notFellowshipQuotes = await quoteResource.listQuotes({
    filters: [{ key: "movieId", value: { ne: "5cd95395de30eff6ebccde5c" } }],
    pagination: { limit: 3 },
  });
  console.log(
    "Non-Fellowship quotes (ne):",
    notFellowshipQuotes.docs.map((q) => q.dialog),
  );

  // Quote: include
  const multiMovieQuotes = await quoteResource.listQuotes({
    filters: [
      {
        key: "movieId",
        value: {
          include: ["5cd95395de30eff6ebccde5c", "5cd95395de30eff6ebccde5d"],
        },
      },
    ],
    pagination: { limit: 5 },
  });
  console.log("Fellowship + RotK quotes (include):", multiMovieQuotes.total);

  // Quote: exclude
  const excludedMovieQuotes = await quoteResource.listQuotes({
    filters: [
      {
        key: "movieId",
        value: { exclude: ["5cd95395de30eff6ebccde5c"] },
      },
    ],
    pagination: { limit: 3 },
  });
  console.log(
    "Quotes excluding Fellowship (exclude):",
    excludedMovieQuotes.docs.map((q) => q.dialog),
  );

  // Quote: regex
  const regexQuotes = await quoteResource.listQuotes({
    filters: [
      { key: "dialog", value: { regex: { pattern: "ring", flags: "i" } } },
    ],
    pagination: { limit: 5 },
  });
  console.log(
    "Quotes matching 'ring' (regex):",
    regexQuotes.docs.map((q) => q.dialog),
  );
}

async function pagination(movieResource: Movie, quoteResource: Quote) {
  // Movie: page-based page 1
  const moviesPage1 = await movieResource.listMovies({
    pagination: { limit: 3, page: 1 },
  });
  console.log(
    "Movies page 1 (limit 3):",
    moviesPage1.docs.map((m) => m.name),
  );

  // Movie: page-based page 2
  const moviesPage2 = await movieResource.listMovies({
    pagination: { limit: 3, page: 2 },
  });
  console.log(
    "Movies page 2 (limit 3):",
    moviesPage2.docs.map((m) => m.name),
  );

  // Movie: offset-based
  const offsetMovies = await movieResource.listMovies({
    pagination: { limit: 2, offset: 4 },
  });
  console.log(
    "Movies offset 4 (limit 2):",
    offsetMovies.docs.map((m) => m.name),
  );

  // Quote: page-based page 1
  const quotesPage1 = await quoteResource.listQuotes({
    pagination: { limit: 3, page: 1 },
  });
  console.log(
    "Quotes page 1 (limit 3):",
    quotesPage1.docs.map((q) => q.dialog),
  );

  // Quote: page-based page 2
  const quotesPage2 = await quoteResource.listQuotes({
    pagination: { limit: 3, page: 2 },
  });
  console.log(
    "Quotes page 2 (limit 3):",
    quotesPage2.docs.map((q) => q.dialog),
  );

  // Quote: offset-based
  const quotesOffset = await quoteResource.listQuotes({
    pagination: { limit: 3, offset: 10 },
  });
  console.log(
    "Quotes offset 10 (limit 3):",
    quotesOffset.docs.map((q) => q.dialog),
  );
}

async function combined(movieResource: Movie, quoteResource: Quote) {
  // Movie: filter + sort + pagination
  const combinedMovies = await movieResource.listMovies({
    filters: [{ key: "academyAwardNominations", value: { gte: 5 } }],
    sort: { key: "boxOfficeRevenueInMillions", order: "asc" },
    pagination: { limit: 10 },
  });
  console.log(
    "Nominated (gte 5) sorted by revenue:",
    combinedMovies.docs.map((m) => m.name),
  );

  // Quote: filter + sort + pagination
  const combinedQuotes = await quoteResource.listQuotes({
    filters: [{ key: "movieId", value: { eq: "5cd95395de30eff6ebccde5d" } }],
    sort: { key: "dialog", order: "asc" },
    pagination: { limit: 10, page: 2 },
  });
  console.log(
    "RotK quotes (filtered + sorted + page 2):",
    combinedQuotes.docs.map((q) => q.dialog),
  );
}

async function subResource(movieResource: Movie) {
  // List all quotes for a movie
  const rotkQuotes = await movieResource.listQuotes("5cd95395de30eff6ebccde5d");
  console.log("Return of the King quotes:", rotkQuotes.total);

  // Filtered by character
  const rotkCharacterQuotes = await movieResource.listQuotes(
    "5cd95395de30eff6ebccde5d",
    {
      filters: [
        { key: "characterId", value: { eq: "5cd99d4bde30eff6ebccfe9e" } },
      ],
    },
  );
  console.log("RotK quotes by character:", rotkCharacterQuotes.total);

  // Paginated
  const rotkQuotesPaginated = await movieResource.listQuotes(
    "5cd95395de30eff6ebccde5d",
    { pagination: { limit: 5, page: 1 } },
  );
  console.log(
    "RotK quotes page 1 (limit 5):",
    rotkQuotesPaginated.docs.map((q) => q.dialog),
  );
}

async function main() {
  const client = new LotRClient();
  const movieResource = new Movie(client);
  const quoteResource = new Quote(client);

  await getById(movieResource, quoteResource);
  await listing(movieResource, quoteResource);
  await sorting(movieResource, quoteResource);
  await filtering(movieResource, quoteResource);
  await pagination(movieResource, quoteResource);
  await combined(movieResource, quoteResource);
  await subResource(movieResource);

  console.log("Demonstration complete.");
}

main();
