import { LotRClient } from "./src/client";
import { Movie } from "./src/models/movie";
import { Quote } from "./src/models/quote";

async function getById(movieModel: Movie, quoteModel: Quote) {
  // Movie
  const fellowship = await movieModel.getMovie("5cd95395de30eff6ebccde5c");
  console.log(
    "Fellowship:",
    fellowship.name,
    `(${fellowship.runtimeInMinutes} min)`,
  );

  // Quote
  const singleQuote = await quoteModel.getQuote("5cd96e05de30eff6ebcce7e9");
  console.log(
    "Single quote:",
    singleQuote.dialog,
    "from movie:",
    singleQuote.movieId,
  );
}

async function listing(movieModel: Movie, quoteModel: Quote) {
  // Movie
  const allMovies = await movieModel.listMovies();
  console.log("All movies:", allMovies.total);

  // Quote
  const allQuotes = await quoteModel.listQuotes({
    pagination: { limit: 5 },
  });
  console.log(
    "Quotes (first 5):",
    allQuotes.docs.map((q) => q.dialog),
  );
}

async function sorting(movieModel: Movie, quoteModel: Quote) {
  // Movie: sort by name
  const moviesSortedByName = await movieModel.listMovies({
    sort: { key: "name", order: "asc" },
  });
  console.log(
    "Movies sorted by name:",
    moviesSortedByName.docs.map((m) => m.name),
  );

  // Quote: sort by dialog
  const sortedQuotes = await quoteModel.listQuotes({
    sort: { key: "dialog", order: "asc" },
    pagination: { limit: 5 },
  });
  console.log(
    "Quotes sorted by dialog:",
    sortedQuotes.docs.map((q) => q.dialog),
  );
}

async function filtering(movieModel: Movie, quoteModel: Quote) {
  // Movie: gt
  const bigBudgetMovies = await movieModel.listMovies({
    filters: [{ key: "budgetInMillions", value: { gt: 200 } }],
  });
  console.log(
    "Big budget movies (gt 200M):",
    bigBudgetMovies.docs.map((m) => m.name),
  );

  // Movie: gte
  const awardWinners = await movieModel.listMovies({
    filters: [{ key: "academyAwardWins", value: { gte: 4 } }],
  });
  console.log(
    "Award winners (gte 4):",
    awardWinners.docs.map((m) => m.name),
  );

  // Movie: lt
  const lowScoreMovies = await movieModel.listMovies({
    filters: [{ key: "rottenTomatoesScore", value: { lt: 70 } }],
  });
  console.log(
    "Low RT score movies (lt 70):",
    lowScoreMovies.docs.map((m) => m.name),
  );

  // Quote: eq
  const movieQuotes = await quoteModel.listQuotes({
    filters: [
      { key: "movieId", value: { eq: "5cd95395de30eff6ebccde5c" } },
    ],
    pagination: { limit: 5 },
  });
  console.log(
    "Fellowship quotes (eq):",
    movieQuotes.docs.map((q) => q.dialog),
  );

  // Quote: ne
  const notFellowshipQuotes = await quoteModel.listQuotes({
    filters: [
      { key: "movieId", value: { ne: "5cd95395de30eff6ebccde5c" } },
    ],
    pagination: { limit: 3 },
  });
  console.log(
    "Non-Fellowship quotes (ne):",
    notFellowshipQuotes.docs.map((q) => q.dialog),
  );

  // Quote: include
  const multiMovieQuotes = await quoteModel.listQuotes({
    filters: [
      {
        key: "movieId",
        value: {
          include: [
            "5cd95395de30eff6ebccde5c",
            "5cd95395de30eff6ebccde5d",
          ],
        },
      },
    ],
    pagination: { limit: 5 },
  });
  console.log("Fellowship + RotK quotes (include):", multiMovieQuotes.total);

  // Quote: exclude
  const excludedMovieQuotes = await quoteModel.listQuotes({
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
  const regexQuotes = await quoteModel.listQuotes({
    filters: [{ key: "dialog", value: { regex: "ring" } }],
    pagination: { limit: 5 },
  });
  console.log(
    "Quotes matching 'ring' (regex):",
    regexQuotes.docs.map((q) => q.dialog),
  );
}

async function pagination(movieModel: Movie, quoteModel: Quote) {
  // Movie: page-based page 1
  const moviesPage1 = await movieModel.listMovies({
    pagination: { limit: 3, page: 1 },
  });
  console.log(
    "Movies page 1 (limit 3):",
    moviesPage1.docs.map((m) => m.name),
  );

  // Movie: page-based page 2
  const moviesPage2 = await movieModel.listMovies({
    pagination: { limit: 3, page: 2 },
  });
  console.log(
    "Movies page 2 (limit 3):",
    moviesPage2.docs.map((m) => m.name),
  );

  // Movie: offset-based
  const offsetMovies = await movieModel.listMovies({
    pagination: { limit: 2, offset: 4 },
  });
  console.log(
    "Movies offset 4 (limit 2):",
    offsetMovies.docs.map((m) => m.name),
  );

  // Quote: page-based page 1
  const quotesPage1 = await quoteModel.listQuotes({
    pagination: { limit: 3, page: 1 },
  });
  console.log(
    "Quotes page 1 (limit 3):",
    quotesPage1.docs.map((q) => q.dialog),
  );

  // Quote: page-based page 2
  const quotesPage2 = await quoteModel.listQuotes({
    pagination: { limit: 3, page: 2 },
  });
  console.log(
    "Quotes page 2 (limit 3):",
    quotesPage2.docs.map((q) => q.dialog),
  );

  // Quote: offset-based
  const quotesOffset = await quoteModel.listQuotes({
    pagination: { limit: 3, offset: 10 },
  });
  console.log(
    "Quotes offset 10 (limit 3):",
    quotesOffset.docs.map((q) => q.dialog),
  );
}

async function combined(movieModel: Movie, quoteModel: Quote) {
  // Movie: filter + sort + pagination
  const combinedMovies = await movieModel.listMovies({
    filters: [{ key: "academyAwardNominations", value: { gte: 5 } }],
    sort: { key: "boxOfficeRevenueInMillions", order: "asc" },
    pagination: { limit: 10 },
  });
  console.log(
    "Nominated (gte 5) sorted by revenue:",
    combinedMovies.docs.map((m) => m.name),
  );

  // Quote: filter + sort + pagination
  const combinedQuotes = await quoteModel.listQuotes({
    filters: [
      { key: "movieId", value: { eq: "5cd95395de30eff6ebccde5d" } },
    ],
    sort: { key: "dialog", order: "asc" },
    pagination: { limit: 10, page: 2 },
  });
  console.log(
    "RotK quotes (filtered + sorted + page 2):",
    combinedQuotes.docs.map((q) => q.dialog),
  );
}

async function subResource(movieModel: Movie) {
  // List all quotes for a movie
  const rotkQuotes = await movieModel.listQuotes("5cd95395de30eff6ebccde5d");
  console.log("Return of the King quotes:", rotkQuotes.total);

  // Filtered by character
  const rotkCharacterQuotes = await movieModel.listQuotes(
    "5cd95395de30eff6ebccde5d",
    {
      filters: [
        { key: "characterId", value: { eq: "5cd99d4bde30eff6ebccfe9e" } },
      ],
    },
  );
  console.log("RotK quotes by character:", rotkCharacterQuotes.total);

  // Paginated
  const rotkQuotesPaginated = await movieModel.listQuotes(
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
  const movieModel = new Movie(client);
  const quoteModel = new Quote(client);

  await getById(movieModel, quoteModel);
  await listing(movieModel, quoteModel);
  await sorting(movieModel, quoteModel);
  await filtering(movieModel, quoteModel);
  await pagination(movieModel, quoteModel);
  await combined(movieModel, quoteModel);
  await subResource(movieModel);

  console.log("Demonstration complete.");
}

main();
