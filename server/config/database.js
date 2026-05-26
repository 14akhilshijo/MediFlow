import mongoose from "mongoose";

/**
 * Connect to MongoDB Atlas using the MONGO_URI from environment variables.
 * Exits the process on failure so the server never starts in a broken state.
 */
export const connectDB = async () => {
  try {
    // Mongoose 7+ no longer needs useNewUrlParser / useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    // Log when connection drops unexpectedly
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected.");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB error: ${err.message}`);
    });
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
