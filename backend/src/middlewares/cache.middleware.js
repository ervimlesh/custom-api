import { getCache, setCache } from "../utils/cache.js";
import crypto from "crypto";

export const flightSearchCache = async (req, res, next) => {
   console.log("hi it's calling now in cache");
  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(req.body))
    .digest("hex");

  const cacheKey = `FLIGHT_SEARCH:${hash}`;

  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      cached: true,
      data: cachedData,
    });
  }

  // attach key to response for later use
  res.locals.cacheKey = cacheKey;
  next();
};

export const saveFlightCache = async (key, data) => {
  await setCache(key, data, 900);
};
