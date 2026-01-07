import moment from "moment";

/**
 * Build Travelomatix / TBO payload
 * Supports:
 * 1) RAW UI input (source, destination, date, etc.)
 * 2) Already-built payload (AdultCount, Segments, etc.)
 */
export const buildTBOPayload = (query) => {
  console.log("📦 buildTBOPayload input:", query);

  /**
   * ----------------------------------------
   * CASE 1: Payload already built (SAFE EXIT)
   * ----------------------------------------
   */
  if (
    query?.Segments &&
    Array.isArray(query.Segments) &&
    query?.JourneyType
  ) {
    console.log("✅ Detected already-built payload, skipping builder");
    return query;
  }

  /**
   * ----------------------------------------
   * CASE 2: RAW UI INPUT
   * ----------------------------------------
   */
  const {
    source,
    destination,
    date,
    rtnDate,
    adults = 1,
    children = 0,
    infants = 0,
    trpType,
    classType = "Economy",
    segments,
  } = query;

  // 🔒 Hard validation (prevents silent crashes)
  if (!trpType) {
    throw new Error("tripType (trpType) is required");
  }

  if (trpType !== "multicity" && (!source || !destination || !date)) {
    throw new Error("source, destination and date are required");
  }

  let payload = {
    AdultCount: Number(adults),
    ChildCount: Number(children),
    InfantCount: Number(infants),
    PreferredAirlines: [""],
    CabinClass: classType,
    Segments: [],
  };

  /**
   * ----------------------------------------
   * MULTICITY
   * ----------------------------------------
   */
  if (trpType === "multicity") {
    if (!segments) {
      throw new Error("segments required for multicity search");
    }

    const parsedSegments =
      typeof segments === "string" ? JSON.parse(segments) : segments;

    payload.JourneyType = "Multicity";

    payload.Segments = parsedSegments.map((seg, index) => {
      if (!seg.from || !seg.to || !seg.date) {
        throw new Error(`Invalid multicity segment at index ${index}`);
      }

      return {
        Origin: seg.from.split("-")[0],
        Destination: seg.to.split("-")[0],
        DepartureDate: moment(new Date(seg.date)).format(
          "YYYY-MM-DDT00:00:00"
        ),
      };
    });
  }

  /**
   * ----------------------------------------
   * ONEWAY
   * ----------------------------------------
   */
  else if (trpType === "OneWay") {
    payload.JourneyType = "OneWay";

    payload.Segments.push({
      Origin: source.split("-")[0],
      Destination: destination.split("-")[0],
      DepartureDate: moment(new Date(date)).format("YYYY-MM-DDT00:00:00"),
    });
  }

  /**
   * ----------------------------------------
   * ROUND TRIP
   * ----------------------------------------
   */
  else if (trpType === "Return" || trpType === "roundtrip") {
    if (!rtnDate) {
      throw new Error("Return date (rtnDate) is required for round trip");
    }

    payload.JourneyType = "Return";

    payload.Segments.push({
      Origin: source.split("-")[0],
      Destination: destination.split("-")[0],
      DepartureDate: moment(new Date(date)).format("YYYY-MM-DDT00:00:00"),
      ReturnDate: moment(new Date(rtnDate)).format("YYYY-MM-DDT00:00:00"),
    });
  }

  /**
   * ----------------------------------------
   * INVALID TRIP TYPE
   * ----------------------------------------
   */
  else {
    throw new Error(`Invalid trip type: ${trpType}`);
  }

  return payload;
};
