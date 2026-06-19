import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = Number(process.env.REDIS_PORT) || 6379;

export const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      tls: process.env.REDIS_URL.includes("upstash") || process.env.REDIS_URL.startsWith("rediss://") 
        ? { rejectUnauthorized: false } 
        : undefined
    })
  : new Redis({
      host: redisHost,
      port: redisPort,
    });

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully.");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});
