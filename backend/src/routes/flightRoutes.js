import express from "express";
import { flightSearchController } from "../controllers/flight.controller.js";
import { flightSearchLimiter } from "../middlewares/rateLimit.middleware.js";
import { flightSearchCache } from "../middlewares/cache.middleware.js";

const router = express.Router();

router.post(
  "/search",
  flightSearchLimiter,
  flightSearchCache,
  flightSearchController
);

export default router;
