import { apiReference } from "@scalar/express-api-reference";
import { ProductStatus, prisma } from "@workspace/database";
import { Product } from "@workspace/types";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import { sendError, sendSuccess } from "@/lib/api-response-helper";
import { auth } from "./lib/auth";
import errorMiddleware from "./presentation/middleware/error.middleware";
import logMiddleware from "./presentation/middleware/log.middleware";
import v1 from "./presentation/routes/v1";

export const CreateServer = (): Express => {
  const app = express();

  console.log("prisma", prisma);



  const configuredOrigins = (
    process.env.CORS_ORIGINS ??
    process.env.CORS_ORIGIN ??
    process.env.NEXT_PUBLIC_APP_URL ??
    ""
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaultOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ];

  const allowedOrigins =
    configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins;

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow non-browser clients (no Origin header)
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Specify allowed HTTP methods
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    })
  );

  // Ensure Better Auth routes also get CORS headers
  app.all("/api/auth/*splat", toNodeHandler(auth));
  // .use(logMiddleware);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get(
    "/docs",
    apiReference({
      pageTitle: "API Documentation",
      sources: [
        // Better Auth schema generation endpoint
        { url: "/api/auth/open-api/generate-schema", title: "Auth" },
      ],
    })
  );

  app.get("/", (_req: Request, res: Response) => {
    sendSuccess(res, { message: "Hello, World!" }, "Welcome to API");
  });

  app.get("/health", (_req: Request, res: Response) => {
    sendSuccess(
      res,
      { timestamp: new Date().toISOString() },
      "Server is healthy"
    );
  });

  // app.get("/test", async (_req: Request, res: Response) => {
  // const products = await prisma.$drizzle
  // .select()
  // .from(Product)
  // .where(eq(Product.status, ProductStatus.PUBLISHED));
  // const products = await prisma.product.findMany();
  // res.json(products);
  // console.log("hey");
  // sendSuccess(res, { message: "Hello, World!" }, "Welcome to API");
  // });

  app.get("/me", async (req: Request, res: Response) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return sendError(res, "Unauthorized", 401);
    }

    sendSuccess(res, { session }, "User session");
  });

  app.use(express.static("public"));

  app.use("/api/v1", v1);

  // Error handling middleware must be last
  app.use(errorMiddleware);

  return app;
};
