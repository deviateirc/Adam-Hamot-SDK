import { config } from "dotenv";
import pino from "pino";
import { request } from "undici";
import { Movie } from "./models/movie";

config();

export const logger = pino({
  name: "lotr-api",
  level: "debug",
  enabled: process.env.DEBUG === "true",
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
      this.log.debug({ statusCode, response }, "Response received");
    } catch (error) {
      this.log.error(
        { statusCode, response: await body.text() },
        "Failed to parse response",
      );
    }

    if (statusCode !== 200) {
      this.log.error({ statusCode, response }, "Request failed");
      throw new Error(`HTTP Error ${statusCode}: reason: ${response}`);
    }

    return response;
  }
}

// list endpoints
// pagination, sorting, filtering
//
// /movie
// /quote
// /movie/{id}/quote
//
// single object endpoint
// /movie/{id}
// /quote/{id}

const main = async () => {
  const client = new LotRClient();
  const movie = new Movie(client);
  const data = await movie.listMovies({ pagination: { limit: 1 } });
  console.log(data);
};

main();
