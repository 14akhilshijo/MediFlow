/**
 * seedAdmin.js
 *
 * Creates the default admin account if it doesn't already exist.
 *
 * Usage (from server/ directory):
 *   node seeds/seedAdmin.js
 *
 * Credentials created:
 *   Email:    admin@mediflow.com
 *   Password: Admin@1234
 *   Role:     Admin
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/database.js";
import { User } from "../models/User.js";

const ADMIN = {
  firstName: "Super",
  lastName:  "Admin",
  email:     "admin@mediflow.com",
  phone:     "9000000000",
  password:  "Admin@1234",
  gender:    "Male",
  dob:       new Date("1985-01-01"),
  role:      "Admin",
};

async function seed() {
  console.log("\n🌱  MediFlow Admin Seed");
  console.log("=======================");

  await connectDB();

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`\n↩  Admin already exists: ${ADMIN.email}`);
    console.log("   Use the existing credentials to log in.\n");
  } else {
    await User.create(ADMIN);
    console.log(`\n✅ Admin created successfully!`);
    console.log(`   Email:    ${ADMIN.email}`);
    console.log(`   Password: ${ADMIN.password}\n`);
  }

  await mongoose.disconnect();
  console.log("🔌  Database disconnected.\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
