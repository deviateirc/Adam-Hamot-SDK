import pino from "pino";
import { request } from "undici";

export const logger = pino({
  name: "lotr-api",
  level: process.env.SDK_LOGGING_LEVEL || "info",
  enabled: process.env.SDK_LOGGING_ENABLED === "true",
});

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: unknown,
  ) {
    super(`HTTP Error ${statusCode}: ${JSON.stringify(body)}`);
    this.name = "ApiError";
  }
}

/**
 * HTTP client for The One API (https://the-one-api.dev).
 * Handles authentication and request execution for all API endpoints.
 *
 * Supported environment variables:
 * - SDK_LOGGING_LEVEL
 *   - Use any pino supported log level
 * - SDK_LOGGING_ENABLED
 *   - Enable logging output
 * - LOTR_API_ACCESS_TOKEN
 *   - *required* Access token
 */
export class LotRClient {
  private accessToken: string;
  private log = logger.child({ module: "LotRClient" });
  static BASE_URL = "https://the-one-api.dev/v2";

  /**
   * @param accessToken - API access token. Falls back to the `LOTR_API_ACCESS_TOKEN` environment variable if not provided.
   * @throws If no access token is found.
   */
  constructor(accessToken?: string) {
    const token = accessToken ?? process.env.LOTR_API_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        "Access token missing! Assign to LOTR_API_ACCESS_TOKEN environment variable and try again.",
      );
    }
    this.accessToken = token;
    this.log.info("Client initialized");
  }

  async get(endpoint: string, params: string[] = []): Promise<unknown> {
    const encodedParams = params.length > 0 ? `?${params.join("&")}` : "";
    const url = `${LotRClient.BASE_URL}/${endpoint}${encodedParams}`;
    this.log.info({ url }, "GET request");

    const { statusCode, body } = await request(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${this.accessToken}` },
      signal: AbortSignal.timeout(30_000),
    });

    const text = await body.text();
    let response: unknown;
    try {
      response = JSON.parse(text);
    } catch (error) {
      this.log.error(
        { statusCode, response: text },
        "Failed to parse response",
      );
      throw error;
    }

    if (statusCode !== 200) {
      this.log.error({ statusCode, response }, "Request failed");
      throw new ApiError(statusCode, response);
    } else {
      this.log.debug({ statusCode, response }, "Response received");
    }

    return response;
  }
}
