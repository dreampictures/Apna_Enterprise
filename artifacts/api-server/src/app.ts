import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import sitemapRouter from "./routes/sitemap";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigins = new Set(
  [
    ...(process.env.CORS_ORIGINS ?? "").split(","),
    process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "",
    ...(process.env.REPLIT_DOMAINS ?? "").split(",").map((domain) => domain.trim() ? `https://${domain.trim()}` : ""),
  ]
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(cors({
  origin(origin, callback) {
    // Same-origin requests and server-to-server callbacks do not send Origin.
    const isLocalPreview = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin ?? "");
    const isReplitPreview = /^https:\/\/[a-z0-9-]+\.replit\.dev$/i.test(origin ?? "");
    if (!origin || allowedOrigins.has(origin) || isLocalPreview || isReplitPreview) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(sitemapRouter);
app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(
    __dirname,
    "../../global-enterprise/dist/public",
  );

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });

    logger.info({ frontendPath }, "Serving frontend static files");
  } else {
    logger.warn({ frontendPath }, "Frontend build not found — skipping static serving");
  }
}

export default app;
