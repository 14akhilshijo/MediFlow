import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/database.js";

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

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
