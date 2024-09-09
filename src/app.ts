import express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { validateApiKey, validateToken } from "./utils/utils";
import connect from "./models/db-config";
import getOrphanageDetailsRouter from "./routes/get-orphanage-details.route";
import editOrphanageRouter from "./routes/edit-orphanage.route";
import project_router from "./routes/project.route";

config();
connect();

const parsed_origins: string = process.env.CLIENT_DOMAIN || "";

const allowedOrigins = [
  ...parsed_origins.split(","),
  process.env.CLIENT_AUTH_SUB_DOMAIN,
];

const app = express();
app.use(
  cors({
    origin: (origin, cb) => {
      if (allowedOrigins.includes(origin) || !origin) cb(null, true);
      else
        throw new Error(
          `Origin '${origin}' not allowed. Allowed hosts: ${allowedOrigins.join(
            ","
          )}`
        );
    },
    credentials: true,
    exposedHeaders: ["is-user", "access-token", "refresh-token"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Validate the API key being passed into the request
app.use(validateApiKey);

app.use("/v1/", getOrphanageDetailsRouter);
app.use("/v1/edit", editOrphanageRouter);
app.use("/v1/project", project_router);

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message || err);
  res.status(err.status || 500).send(err.message || "Something went wrong");
});

export default app;
