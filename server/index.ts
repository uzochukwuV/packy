import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { startMonitoring, stopMonitoring } from "./web3/game-monitor";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(process.env.PORT || 5000, () => {
    log(`Server listening on port ${process.env.PORT || 5000}`);

    // Start GameEngine monitoring system
    // Only start if Web3 config is available
    if (process.env.ADMIN_PRIVATE_KEY && process.env.RPC_URL) {
      try {
        startMonitoring();
        log('GameEngine monitoring started', 'web3');
      } catch (error: any) {
        log(`Failed to start GameEngine monitoring: ${error.message}`, 'web3');
      }
    } else {
      log('GameEngine monitoring disabled (missing ADMIN_PRIVATE_KEY or RPC_URL)', 'web3');
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    log('Shutting down server...');
    stopMonitoring();
    httpServer.close(() => {
      log('Server shut down');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    log('Shutting down server...');
    stopMonitoring();
    httpServer.close(() => {
      log('Server shut down');
      process.exit(0);
    });
  });
})();
