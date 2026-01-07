import cluster from "cluster";
import os from "os";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/connectDB.js";
import flightRoutes from "./routes/flightRoutes.js";

dotenv.config();

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 8000;

/**
 * ======================================
 * CLUSTER MODE (PRODUCTION)
 * ======================================
 */
if (cluster.isPrimary) {
  console.log(`👑 Primary process ${process.pid} running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  /**
   * ======================================
   * WORKER PROCESS
   * ======================================
   */
  const app = express();

  const startServer = async () => {
    try {
      // 🔹 DB FIRST
      await connectDB();

      // 🔹 Trust proxy (EC2 / NGINX / Load Balancer)
      app.set("trust proxy", 1);

      // 🔹 Middleware
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(express.json());
      app.use(cookieParser());

      app.use(
        cors({
          origin: process.env.CLIENT_URL || "*",
          credentials: true,
        })
      );

      app.use(morgan("combined"));

      // 🔹 Static files
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      app.use("/uploads", express.static(path.join(__dirname, "uploads")));

      const buildPath = path.join(__dirname, "../frontend/dist");
      app.use(express.static(buildPath));

      // 🔹 Routes
      app.use("/api/v1/flights", flightRoutes);

      app.get("/health", (req, res) => {
        res.status(200).json({ status: "OK", worker: process.pid });
      });

      // 🔹 Global error handler
      app.use((err, req, res, next) => {
        console.error("🔥 Global Error:", err.message);
        res.status(500).json({
          success: false,
          message: err.message || "Internal Server Error",
        });
      });

      // 🔹 HTTP + Socket
      const server = http.createServer(app);

      const io = new Server(server, {
        cors: {
          origin: process.env.CLIENT_URL || "*",
          methods: ["GET", "POST"],
        },
      });

      server.listen(PORT, () => {
        console.log(
          `🚀 Worker ${process.pid} running on port ${PORT}`
        );
      });
    } catch (err) {
      console.error("❌ Server failed to start:", err.message);
      process.exit(1);
    }
  };

  startServer();
}

/**
 * ======================================
 * GLOBAL PROCESS HANDLERS
 * ======================================
 */
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received. Shutting down gracefully.");
  process.exit(0);
});
