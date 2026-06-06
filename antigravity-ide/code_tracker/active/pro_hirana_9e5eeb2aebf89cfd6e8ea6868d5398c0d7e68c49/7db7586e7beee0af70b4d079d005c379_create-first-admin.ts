�$import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Load environment variables
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file explicitly (dotenv/config only loads .env by default)
config({ path: resolve(process.cwd(), ".env.local") });

async function createFirstAdmin() {
  try {
    console.log("🔐 Creating first admin user...\n");

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error("❌ ERROR: DATABASE_URL environment variable is not set");
      console.log("\nPlease add DATABASE_URL to .env.local");
      process.exit(1);
    }

    console.log("✅ DATABASE_URL environment variable is set\n");

    // Get user input
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error("❌ ERROR: Missing required arguments");
      console.log("\nUsage:");
      console.log("  bun run scripts/create-first-admin.ts <email> <password>");
      console.log("  npm run create-first-admin <email> <password>");
      console.log("\nExample:");
      console.log('  bun run scripts/create-first-admin.ts admin@example.com "SecurePassword123!"');
      process.exit(1);
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ ERROR: Invalid email address");
      process.exit(1);
    }

    // Validate password
    if (password.length < 8) {
      console.error("❌ ERROR: Password must be at least 8 characters long");
      process.exit(1);
    }

    console.log("📧 Email:", email);
    console.log("🔑 Password: " + "*".repeat(password.length) + "\n");

    // Connect to database
    const sql = postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 1,
    });

    console.log("🔌 Connecting to database...");

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id, email FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (existingUsers.length > 0) {
      console.log("⚠️  User with this email already exists");
      
      // Ask if we should update role to admin
      const existingProfiles = await sql`
        SELECT role FROM profiles WHERE id = ${existingUsers[0].id}
      `;

      if (existingProfiles.length > 0 && existingProfiles[0].role === "admin") {
        console.log("✅ User is already an admin");
        await sql.end();
        process.exit(0);
      } else {
        console.log("🔄 Updating user role to admin...");
        await sql`
          UPDATE profiles SET role = 'admin' WHERE id = ${existingUsers[0].id}
        `;
        console.log("✅ User role updated to admin");
        await sql.end();
        process.exit(0);
      }
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = randomUUID();
    const now = new Date();

    console.log("👤 Creating user...");
    await sql`
      INSERT INTO users (id, email, password_hash, email_verified, is_active, created_at, updated_at)
      VALUES (${userId}, ${email.toLowerCase()}, ${passwordHash}, true, true, ${now}, ${now})
    `;

    // Create profile with admin role
    console.log("👔 Creating admin profile...");
    await sql`
      INSERT INTO profiles (id, email, role, created_at, updated_at)
      VALUES (${userId}, ${email.toLowerCase()}, 'admin', ${now}, ${now})
    `;

    console.log("\n✅ First admin user created successfully!");
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 User ID: ${userId}`);
    console.log("\n🎉 You can now log in with this account");

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed to create admin user!");
    console.error("Error:", error instanceof Error ? error.message : error);

    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 Tip: Make sure your database server is running");
    } else if (error instanceof Error && error.message.includes("authentication")) {
      console.error("\n💡 Tip: Check your DATABASE_URL credentials");
    } else if (error instanceof Error && error.message.includes("duplicate key")) {
      console.error("\n💡 Tip: A user with this email already exists");
    }

    process.exit(1);
  }
}

createFirstAdmin();

�$*cascade08"(9e5eeb2aebf89cfd6e8ea6868d5398c0d7e68c492Dfile:///c:/Users/HP/Desktop/pro_hirana/scripts/create-first-admin.ts:&file:///c:/Users/HP/Desktop/pro_hirana