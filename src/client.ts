import { config } from "dotenv";
import pino from "pino";
import { request } from "undici";
import { Movie } from "./models/movie";

config();

export const logger = pino({
  name: "lotr-api",
  level: process.env.SDK_LOGGING_LEVEL || "info",
  enabled: process.env.SDK_LOGGING_ENABLED === "true",
});

export class LotRClient {
  private accessToken: string;
  private log = logger.child({ module: "LotRClient" });
  static BASE_URL = "https://the-one-api.dev/v2";

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
    });

    let response;
    try {
      response = await body.json();
    } catch (error) {
      this.log.error(
        { statusCode, response: await body.text() },
        "Failed to parse response",
      );
      throw error;
    }

    if (statusCode !== 200) {
      this.log.error({ statusCode, response }, "Request failed");
      throw new Error(
        `HTTP Error ${statusCode}: reason: ${JSON.stringify(response)}`,
      );
    } else {
      this.log.debug({ statusCode, response }, "Response received");
    }

    return response;
  }
}

const main = async () => {
  const client = new LotRClient();
  const movie = new Movie(client);
  const data = await movie.listQuotes("5cd95395de30eff6ebccde5c");
  console.log(data);
};

main();
