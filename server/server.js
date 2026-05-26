/**
 * MediFlow – Entry Point
 *
 * IMPORTANT: `import "dotenv/config"` MUST be the very first import.
 * In ES modules all imports are hoisted and evaluated before any code runs,
 * so using dotenv.config() as a statement is too late – other modules have
 * already read process.env by then. Importing "dotenv/config" as a side-effect
 * import ensures .env is loaded first in the module evaluation order.
 */
import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 5000;

// ─── Unhandled Rejection Safety Net ──────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 MediFlow API running`);
    console.log(`   ➜ Local:   http://localhost:${PORT}`);
    console.log(`   ➜ Health:  http://localhost:${PORT}/health`);
    console.log(`   ➜ Env:     ${process.env.NODE_ENV}\n`);
  });
};

startServer();
