import axios from "axios";
import { TBO_CONFIG } from "../config/tbo.config.js";

export const searchFlightsTBO = async (payload) => {
  try {
    console.log("bofore calling api ")
    const response = await axios.post(
      `${TBO_CONFIG.BASE_URL}/webservices/index.php/flight/service/Search`,
      payload,
      {
        headers: {
          "x-DomainKey": TBO_CONFIG.TMX_DOMAIN_KEY,
          "x-Username": TBO_CONFIG.TMX_USERNAME,
          "x-Password": TBO_CONFIG.TMX_PASSWORD,
          "x-system": TBO_CONFIG.TMX_SYSTEM,
          "Content-Type": "application/json",
        },
        // auth: {
        //   username: TBO_CONFIG.USERNAME,
        //   password: TBO_CONFIG.PASSWORD,
        // },
      }
    );
    console.log("upcoming response is :",response.data);

    return response.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};
