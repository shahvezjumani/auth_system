import express, { json } from "express";
import morgan from "morgan";

const app = express();

app.use(json());
app.use(morgan("dev"));

export default app;