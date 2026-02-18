# LOTR SDK Design

TypeScript SDK for [The One API](https://the-one-api.dev/v2).

## Architecture

The design of this SDK was aimed to be as close to the API as possible while making changes to improve developer experience. Notable improvements were renaming fields on the schema objects to make it clearer what they represented.

While abstractions could have been made (for example automating pagination to retrieve all results in a list call), I felt it is clearer to keep the SDK simple to avoid confusion when facing rate limit errors. I believe keeping the SDK client logic simple prevents developers from having to read the source code to understand unexpected behavior.

The code is broken into three categories:

- **Client** (`LotRClient`) — thin HTTP wrapper over Undici. Takes a bearer token (constructor arg or `LOTR_API_ACCESS_TOKEN` env var), exposes a single `get(endpoint, params)` method.

The `get` method is fairly naive and low level, it will take the given parameters and build out the URL to send an HTTP GET network request to. If we were to implement other HTTP methods, they would exist as methods on this client.

This class is more out of convenience to keep the resource implementations simple and not have to concern themselves with building the API URL correctly along with handling HTTP response codes + low level logging.

- **Resources** (`Movie`, `Quote`) — each extends `BaseResource` and provides `list*` and `get*` methods. Responsible for calling the client and parsing responses through Zod schemas.

The resource classes were built to be extensible for future endpoint implementation by extending the `BaseResource`. These classes are heavily tied to their corresponding schema files which ensure valid inputs and outputs to the API. The validation is done on the client side to improve developer experience with better error messages and attempt to catch any issues before sending requests to the API. This is helpful to avoid unnecessary calls to the API wasting usage on errors that could be found locally.

- **Schemas** — Zod schemas that validate API responses and transform query parameters. Handles `_id` → `movieId`/`quoteId` renaming and converts typed filter/sort/pagination objects into URL query strings.

As this is a TypeScript library, there were strong attempts made to maintain type safety when calling the resource methods. For example, when passing in `filter` parameters the `key` field will produce a type error if the key does not exist on the resource schema. Additionally, for a given filter if it is an invalid filter key or invalid value for the given key, the type check will fail.

The API is a bit of a black box in terms of supported behavior. For example, sorting movie names fails when the documentation seems to imply it is valid on _any_ "list" endpoint, i.e., `https://the-one-api.dev/v2/movie?sort=name:asc` yields an HTTP 500 Error.

In addition to validation, the Zod schema handles serialization of filter and sort schemas. This is done to simplify the logic around building the request parameters. While Zod is used for this serialization, the logic could be implemented in the params serialization function as well. The driving decision for the coupling was to centralize the schema fields as well as how they would be serialized to simplify adding new fields (i.e., adding a new filter operation).

### Dependencies

This library depends heavily on `zod` to build and validate requests. This was an intentional design choice as zod is a very popular validation library in TypeScript. It is not necessarily the fastest, but if it became the bottleneck it could be swapped out or a slimmed down version of this library could be made without the validation pieces (only type checking).

The dependency `Undici` was chosen as a lightweight HTTP client that is fast and could be used to make the network operations faster if needed by using its other available methods. Examples of this would be implementing its `Cache Interceptor` feature.

To give low-level insight into the SDK behavior, I added the `pino` logger. This could seem unnecessary, but is helpful when debugging why certain API calls fail. The logging is opt-in to get out of the developer's way and is only there as a helpful debug resource. If desired, we could pull this out entirely and operate on a lightweight log interface such that whoever implements this library could provide their own logging library they prefer to use (or plug in their existing application logger).

Rather than install a third-party testing library, I chose to use node's built-in test runner for unit testing. If I had more time, I potentially would have developed integration tests backing the endpoints using [`mock-server`](https://mock-server.com/). I wanted to avoid writing tests against the live API given the rate limiting concerns.
