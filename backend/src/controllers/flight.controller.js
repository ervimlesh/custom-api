import { saveFlightCache } from "../middlewares/cache.middleware.js";
import { searchFlightsTBO } from "../services/tboFlight.service.js";
import { buildTBOPayload } from "../utils/buildTBOPayload.js";

export const flightSearchController = async (req, res, next) => {
  try {
 
    const payload = buildTBOPayload(req.body);

    console.log("valid payload is ",payload);

    const result = await searchFlightsTBO({ ...payload });

    // Save to Redis
    if (res.locals.cacheKey) {
      await saveFlightCache(res.locals.cacheKey, result);
    }

    res.status(200).json({
      success: true,
      cached: false,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
