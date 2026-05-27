/**
 * seedDoctors.js
 *
 * Seeds 5 doctors (with User accounts + Department records) into MongoDB.
 *
 * Usage:
 *   node seeds/seedDoctors.js          → insert seed data
 *   node seeds/seedDoctors.js --clear  → wipe doctors + their users, then re-seed
 *
 * Run from the server/ directory:
 *   cd server && node seeds/seedDoctors.js
 */

import "dotenv/config";
import mongoose from "mongoose";

import { connectDB } from "../config/database.js";
import { User }       from "../models/User.js";
import { Doctor }     from "../models/Doctor.js";
import { Department } from "../models/Department.js";

// ─── Departments ──────────────────────────────────────────────────────────────
const departmentData = [
  {
    name:        "Cardiology",
    description: "Diagnosis and treatment of heart and cardiovascular system disorders.",
    icon:        "heart",
    isActive:    true,
  },
  {
    name:        "Neurology",
    description: "Diagnosis and treatment of disorders of the nervous system.",
    icon:        "brain",
    isActive:    true,
  },
  {
    name:        "Orthopedics",
    description: "Diagnosis and treatment of musculoskeletal system conditions.",
    icon:        "bone",
    isActive:    true,
  },
  {
    name:        "Pediatrics",
    description: "Medical care for infants, children, and adolescents.",
    icon:        "baby",
    isActive:    true,
  },
  {
    name:        "Dermatology",
    description: "Diagnosis and treatment of skin, hair, and nail conditions.",
    icon:        "skin",
    isActive:    true,
  },
];

// ─── Doctor Seed Data ─────────────────────────────────────────────────────────
// All avatar URLs verified 200 OK from Unsplash CDN.
// Every photo is a professional doctor in white coat / medical uniform.
const doctorSeeds = [
  // ── 1. Cardiologist — Dr. Arjun Mehta (Male) ─────────────────────────────
  {
    user: {
      firstName: "Arjun",
      lastName:  "Mehta",
      email:     "arjun.mehta@mediflow.com",
      phone:     "9876543210",
      password:  "Doctor@1234",
      gender:    "Male",
      dob:       new Date("1978-03-15"),
      role:      "Doctor",
      avatar: {
        public_id: "mediflow/doctors/arjun_mehta",
        // Smart male doctor, white coat, stethoscope, confident arms-crossed pose
        url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=750&fit=crop&crop=top&q=90",
      },
    },
    doctor: {
      departmentName:  "Cardiology",
      specialization:  "Interventional Cardiology",
      experience:      18,
      consultationFee: 800,
      followUpFee:     400,
      bio: "Dr. Arjun Mehta is a senior interventional cardiologist with 18 years of experience in complex coronary interventions, structural heart disease, and cardiac imaging. He has performed over 3,000 angioplasty procedures and is a fellow of the American College of Cardiology.",
      qualifications: [
        { degree: "MBBS",    institution: "AIIMS New Delhi",          year: 2002 },
        { degree: "MD (Medicine)", institution: "PGIMER Chandigarh",  year: 2005 },
        { degree: "DM (Cardiology)", institution: "AIIMS New Delhi",  year: 2008 },
      ],
      availableSlots: [
        { day: "Monday",    startTime: "09:00", endTime: "13:00", isAvailable: true, maxPatients: 12 },
        { day: "Wednesday", startTime: "09:00", endTime: "13:00", isAvailable: true, maxPatients: 12 },
        { day: "Friday",    startTime: "14:00", endTime: "18:00", isAvailable: true, maxPatients: 10 },
      ],
      rating:              { average: 4.8, count: 245 },
      isVerified:          true,
      isAcceptingPatients: true,
    },
  },

  // ── 2. Neurologist — Dr. Priya Sharma (Female) ───────────────────────────
  {
    user: {
      firstName: "Priya",
      lastName:  "Sharma",
      email:     "priya.sharma@mediflow.com",
      phone:     "9876543211",
      password:  "Doctor@1234",
      gender:    "Female",
      dob:       new Date("1982-07-22"),
      role:      "Doctor",
      avatar: {
        public_id: "mediflow/doctors/priya_sharma",
        // Stylish female doctor, white coat, stethoscope, confident smile — verified ✅
        url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=750&fit=crop&crop=top&q=90",
      },
    },
    doctor: {
      departmentName:  "Neurology",
      specialization:  "Stroke & Cerebrovascular Neurology",
      experience:      12,
      consultationFee: 700,
      followUpFee:     350,
      bio: "Dr. Priya Sharma specialises in stroke management, epilepsy, and movement disorders. With 12 years of clinical experience, she has been instrumental in establishing the stroke unit at her previous hospital and has published 20+ peer-reviewed papers on cerebrovascular disease.",
      qualifications: [
        { degree: "MBBS",          institution: "Grant Medical College, Mumbai", year: 2006 },
        { degree: "MD (Medicine)", institution: "KEM Hospital, Mumbai",          year: 2009 },
        { degree: "DM (Neurology)", institution: "NIMHANS Bangalore",            year: 2012 },
      ],
      availableSlots: [
        { day: "Tuesday",   startTime: "10:00", endTime: "14:00", isAvailable: true, maxPatients: 10 },
        { day: "Thursday",  startTime: "10:00", endTime: "14:00", isAvailable: true, maxPatients: 10 },
        { day: "Saturday",  startTime: "09:00", endTime: "12:00", isAvailable: true, maxPatients: 8  },
      ],
      rating:              { average: 4.9, count: 189 },
      isVerified:          true,
      isAcceptingPatients: true,
    },
  },

  // ── 3. Orthopedic Surgeon — Dr. Rajesh Kumar (Male) ─────────────────────
  {
    user: {
      firstName: "Rajesh",
      lastName:  "Kumar",
      email:     "rajesh.kumar@mediflow.com",
      phone:     "9876543212",
      password:  "Doctor@1234",
      gender:    "Male",
      dob:       new Date("1975-11-08"),
      role:      "Doctor",
      avatar: {
        public_id: "mediflow/doctors/rajesh_kumar",
        // Senior male doctor, white coat, stethoscope, professional look — verified ✅
        url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=750&fit=crop&crop=top&q=90",
      },
    },
    doctor: {
      departmentName:  "Orthopedics",
      specialization:  "Joint Replacement & Sports Medicine",
      experience:      22,
      consultationFee: 900,
      followUpFee:     450,
      bio: "Dr. Rajesh Kumar is a highly experienced orthopedic surgeon specialising in total knee and hip replacement, arthroscopic surgery, and sports injuries. He has performed over 5,000 joint replacement surgeries and is a visiting consultant at multiple premier hospitals across India.",
      qualifications: [
        { degree: "MBBS",          institution: "Maulana Azad Medical College, Delhi", year: 1999 },
        { degree: "MS (Ortho)",    institution: "AIIMS New Delhi",                     year: 2003 },
        { degree: "Fellowship (Joint Replacement)", institution: "Royal College of Surgeons, UK", year: 2005 },
      ],
      availableSlots: [
        { day: "Monday",    startTime: "08:00", endTime: "12:00", isAvailable: true, maxPatients: 15 },
        { day: "Wednesday", startTime: "14:00", endTime: "18:00", isAvailable: true, maxPatients: 15 },
        { day: "Friday",    startTime: "08:00", endTime: "12:00", isAvailable: true, maxPatients: 12 },
      ],
      rating:              { average: 4.7, count: 312 },
      isVerified:          true,
      isAcceptingPatients: true,
    },
  },

  // ── 4. Pediatrician — Dr. Sneha Patel (Female) ───────────────────────────
  {
    user: {
      firstName: "Sneha",
      lastName:  "Patel",
      email:     "sneha.patel@mediflow.com",
      phone:     "9876543213",
      password:  "Doctor@1234",
      gender:    "Female",
      dob:       new Date("1985-04-30"),
      role:      "Doctor",
      avatar: {
        public_id: "mediflow/doctors/sneha_patel",
        // Young female doctor, white coat, warm smile, stethoscope — verified ✅
        url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=750&fit=crop&crop=top&q=90",
      },
    },
    doctor: {
      departmentName:  "Pediatrics",
      specialization:  "Neonatology & Developmental Pediatrics",
      experience:      10,
      consultationFee: 600,
      followUpFee:     300,
      bio: "Dr. Sneha Patel is a compassionate pediatrician with a special focus on newborn care, developmental delays, and childhood nutrition. She completed her neonatology fellowship from AIIMS and has helped thousands of families navigate the challenges of early childhood health.",
      qualifications: [
        { degree: "MBBS",           institution: "B.J. Medical College, Ahmedabad", year: 2009 },
        { degree: "MD (Pediatrics)", institution: "AIIMS New Delhi",                year: 2012 },
        { degree: "Fellowship (Neonatology)", institution: "AIIMS New Delhi",       year: 2014 },
      ],
      availableSlots: [
        { day: "Monday",    startTime: "10:00", endTime: "14:00", isAvailable: true, maxPatients: 20 },
        { day: "Tuesday",   startTime: "10:00", endTime: "14:00", isAvailable: true, maxPatients: 20 },
        { day: "Thursday",  startTime: "10:00", endTime: "14:00", isAvailable: true, maxPatients: 20 },
        { day: "Saturday",  startTime: "09:00", endTime: "13:00", isAvailable: true, maxPatients: 15 },
      ],
      rating:              { average: 4.9, count: 421 },
      isVerified:          true,
      isAcceptingPatients: true,
    },
  },

  // ── 5. Dermatologist ─────────────────────────────────────────────────────
  {
    user: {
      firstName: "Vikram",
      lastName:  "Singh",
      email:     "vikram.singh@mediflow.com",
      phone:     "9876543214",
      password:  "Doctor@1234",
      gender:    "Male",
      dob:       new Date("1980-09-14"),
      role:      "Doctor",
      avatar: {
        public_id: "mediflow/doctors/vikram_singh",
        // Smart male doctor, white coat, stethoscope, modern look
        url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=750&fit=crop&crop=top&q=90",
      },
    },
    doctor: {
      departmentName:  "Dermatology",
      specialization:  "Cosmetic Dermatology & Trichology",
      experience:      15,
      consultationFee: 750,
      followUpFee:     375,
      bio: "Dr. Vikram Singh is a board-certified dermatologist with expertise in medical and cosmetic dermatology, hair loss treatments, and laser procedures. He has trained at leading institutions in India and the UK and is known for his patient-centric approach to skin and hair care.",
      qualifications: [
        { degree: "MBBS",              institution: "SMS Medical College, Jaipur",  year: 2004 },
        { degree: "MD (Dermatology)",  institution: "PGIMER Chandigarh",            year: 2007 },
        { degree: "Fellowship (Cosmetic Dermatology)", institution: "British Association of Dermatologists, UK", year: 2009 },
      ],
      availableSlots: [
        { day: "Tuesday",   startTime: "11:00", endTime: "15:00", isAvailable: true, maxPatients: 12 },
        { day: "Wednesday", startTime: "11:00", endTime: "15:00", isAvailable: true, maxPatients: 12 },
        { day: "Friday",    startTime: "11:00", endTime: "15:00", isAvailable: true, maxPatients: 12 },
        { day: "Saturday",  startTime: "10:00", endTime: "13:00", isAvailable: true, maxPatients: 10 },
      ],
      rating:              { average: 4.6, count: 178 },
      isVerified:          true,
      isAcceptingPatients: true,
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Upsert a department by name; returns the document. */
async function upsertDepartment(data) {
  const existing = await Department.findOne({ name: data.name });
  if (existing) {
    console.log(`  ↩  Department already exists: ${data.name}`);
    return existing;
  }
  const dept = await Department.create(data);
  console.log(`  ✅ Department created: ${dept.name}`);
  return dept;
}

/** Delete a doctor's User + Doctor documents by email (for --clear). */
async function clearDoctor(email) {
  const user = await User.findOne({ email });
  if (!user) return;
  await Doctor.deleteOne({ user: user._id });
  await User.deleteOne({ _id: user._id });
  console.log(`  🗑  Cleared doctor: ${email}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const shouldClear = process.argv.includes("--clear");

  console.log("\n🌱  MediFlow Doctor Seed Script");
  console.log("================================");

  await connectDB();

  // ── Optional clear ────────────────────────────────────────────────────────
  if (shouldClear) {
    console.log("\n🗑  Clearing existing seed doctors…");
    for (const { user } of doctorSeeds) {
      await clearDoctor(user.email);
    }
  }

  // ── Upsert departments ────────────────────────────────────────────────────
  console.log("\n📂  Upserting departments…");
  const deptMap = {};
  for (const dept of departmentData) {
    const doc = await upsertDepartment(dept);
    deptMap[dept.name] = doc._id;
  }

  // ── Seed doctors ──────────────────────────────────────────────────────────
  console.log("\n👨‍⚕️  Seeding doctors…");

  const results = { created: 0, skipped: 0, errors: 0 };

  for (const seed of doctorSeeds) {
    const { user: userData, doctor: doctorData } = seed;

    try {
      // Skip if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`  ↩  Skipped (already exists): ${userData.email}`);
        results.skipped++;
        continue;
      }

      // Create User — let the pre-save hook handle password hashing
      const user = await User.create({ ...userData });

      // Resolve department ObjectId
      const departmentId = deptMap[doctorData.departmentName];
      if (!departmentId) {
        throw new Error(`Department not found: ${doctorData.departmentName}`);
      }

      // Create Doctor profile
      const { departmentName, ...doctorFields } = doctorData;
      await Doctor.create({
        user:       user._id,
        department: departmentId,
        ...doctorFields,
      });

      console.log(`  ✅ Created: Dr. ${userData.firstName} ${userData.lastName} (${doctorData.specialization})`);
      results.created++;

    } catch (err) {
      console.error(`  ❌ Error seeding ${userData.email}: ${err.message}`);
      results.errors++;
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n📊  Seed Summary");
  console.log("─────────────────");
  console.log(`  Created : ${results.created}`);
  console.log(`  Skipped : ${results.skipped}`);
  console.log(`  Errors  : ${results.errors}`);
  console.log("");

  await mongoose.disconnect();
  console.log("🔌  Database disconnected.\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
