import logger from "@/lib/logger";
import { config } from "./config";
import { CreateServer } from "./server";

const server = CreateServer();

// Listen on 0.0.0.0 to allow Heroku to bind to the port
const host = process.env.HOST || "0.0.0.0";

server.listen(config.port, host, () => {
  logger.info(
    { port: config.port, host },
    `Server is running at http://${host}:${config.port}`
  );
});
