# Adam Hamot's "The One API SDK" Implementation

### Dependencies

You will need a API key to use this SDK. You can get one by [signing up](https://the-one-api.dev/sign-up). Once signed up, export the following environment variable with the value of your key. You can assign it in a `.env` file as well.

```bash
export LOTR_API_ACCESS_TOKEN=your-api-key-123
```

> [!WARNING]
> Access for authenticated users to all endpoints is limited to 100 requests every 10 minutes. Be fair!

### Logging

To log API calls you can set the following environment variables:

```bash
# Must be set to true in order for any logs to output
export SDK_LOGGING_ENABLED=true

# Set to any valid pino log level
export SDK_LOGGING_LEVEL=info
```

Logging is disabled by default.

### Compatibility

This typescript package is built using node v24.13.1 and typescript 5.9.3. Developers working on this package should use the specified node version in `.nvmrc`, but this package can be installed and used by node 18+. It is advised to use the latest node LTS with this packge for maximum compatibility.

# How to Use

### Example Usage

```typescript
import { LotRClient } from "./src/client";
import { Movie } from "./src/resources/movie";

const main = async () => {
  const client = new LotRClient();
  const movieResource = new Movie(client);

  const movies = await movieResource.listMovies();
  console.log("movies from API:", JSON.stringify(movies, undefined, 2));
};

main();
```

### Demonstration file

For a better understanding of the library capabilities you can refer to `demonstration.ts`.

The `dotenv` package as a convienence during development. You can set up your `.env` file and run the demonstration using the following commands:

```bash
# Set up node if not done already
nvm use

# Install dev/dependencies
npm install

# Set LOTR API access token
echo "export LOTR_API_ACCESS_TOKEN=your-api-key-123" > .env

# Run demonstration file
tsx --import dotenv/config demonstration.ts
```

# Development

The following commands are available when developing this library further:
`npm run test` - run unit tests
`npm run lint` - lint the code
`npm run format` - format code

A pre-commit hook is set up running the above commands while CI/CD is not implemented.

## TODO

- Set up CI/CD to automatically run lint/test/format checks.

# Publishing

To test publishing locally (without pushing to npm):

```bash
# Simulate npm publish
npm run build && npm pack

# In another code folder
npm install path/to/lotr-api/lotr-api-1.0.0.tgz
```
