import express from "express";
import flightRoutes from "./routes/flightRoutes.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

// Global middlewares
app.use(express.json());

// Routes
app.use("/api/flights", flightRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
