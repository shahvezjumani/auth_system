import express, { json } from "express";
import morgan from "morgan";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

app.use(json());
app.use(morgan("dev"));

import authRoutes from "./routes/auth.routes.js";

app.use("/api/auth", authRoutes);

app.use(errorHandler);
export default app;
