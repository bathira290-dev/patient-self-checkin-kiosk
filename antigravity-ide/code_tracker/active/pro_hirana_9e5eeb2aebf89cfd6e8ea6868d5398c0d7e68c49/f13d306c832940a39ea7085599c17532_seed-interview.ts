�import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file explicitly (dotenv/config only loads .env by default)
config({ path: resolve(process.cwd(), ".env.local") });

import { getDb } from "../lib/db/server";
import { aiInterviews } from "../lib/db/schema";

async function seedInterview() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error("❌ ERROR: DATABASE_URL environment variable is not set");
      console.log("\nPlease add DATABASE_URL to .env.local");
      process.exit(1);
    }

    console.log("✅ DATABASE_URL environment variable is set\n");
    console.log("📝 Inserting test interview record...\n");

    const db = getDb();

    const [newInterview] = await db
      .insert(aiInterviews)
      .values({
        candidateName: "John Doe",
        candidateEmail: "john.doe@example.com",
        jobRole: "Senior Frontend Developer",
        interviewDate: new Date().toISOString().split("T")[0],
        interviewTime: "14:00",
        status: "scheduled",
        interviewType: "ai_screening",
        notes: "Test interview record",
      })
      .returning();

    console.log("✅ Interview record inserted successfully!");
    console.log("Interview ID:", newInterview.interviewId);
    console.log("Candidate:", newInterview.candidateName);
    console.log("Job Role:", newInterview.jobRole);
    console.log("Status:", newInterview.status);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting interview:", error);
    process.exit(1);
  }
}

seedInterview();

�*cascade08"(9e5eeb2aebf89cfd6e8ea6868d5398c0d7e68c492@file:///c:/Users/HP/Desktop/pro_hirana/scripts/seed-interview.ts:&file:///c:/Users/HP/Desktop/pro_hirana