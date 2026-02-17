import { config } from "dotenv";
import { request } from "undici";
import { Movie } from "./models/movie";

config();

export class LotRClient {
  private accessToken: string;
  static BASE_URL = "https://the-one-api.dev/v2";

  constructor(accessToken?: string) {
    const token = accessToken ?? process.env.LOTR_API_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        "Access token missing! Assign to LOTR_API_ACCESS_TOKEN environment variable and try again.",
      );
    }
    this.accessToken = token;
  }

  async get(endpoint: string, params: string[] = []) {
    const encodedParams =
      params.length > 0
        ? `?${params.map((p) => encodeURIComponent(p)).join("&")}`
        : "";

    const { statusCode, body } = await request(
      `${LotRClient.BASE_URL}/${endpoint}${encodedParams}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${this.accessToken}` },
      },
    );

    if (statusCode !== 200) {
      throw new Error(`Request failure: ${body.text()}`);
    }

    return body.json();
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
  const data = await movie.listMovies();
  console.log(data);
};

main();
