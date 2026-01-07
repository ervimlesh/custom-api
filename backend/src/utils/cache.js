import redis from "../config/redis.js";

export const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key, value, ttl = 900) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};
