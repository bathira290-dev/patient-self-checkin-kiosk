�import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file explicitly (dotenv/config only loads .env by default)
config({ path: resolve(process.cwd(), ".env.local") });

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...\n");

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error("❌ ERROR: DATABASE_URL environment variable is not set");
      console.log("\nPlease add DATABASE_URL to .env.local:");
      console.log("   DATABASE_URL=postgresql://user:password@host:port/database");
      console.log("\nOr set it in your environment:");
      console.log("   export DATABASE_URL='postgresql://user:password@host:port/database'");
      process.exit(1);
    }

    console.log("✅ DATABASE_URL environment variable is set");
    const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log(`   URL: ${maskedUrl.substring(0, 80)}...`);

    console.log("\n🔌 Attempting to connect to database...");

    const client = postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 1,
    });

    // Try a simple query
    const result = await client`SELECT NOW() as current_time, version() as db_version`;

    console.log("\n✅ Database connection successful!");
    console.log(`   Current time: ${result[0]?.current_time}`);
    console.log(`   PostgreSQL version: ${result[0]?.db_version?.substring(0, 50)}...`);

    // Check if tickets table exists
    try {
      const tablesResult = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tickets'
      `;

      if (tablesResult.length > 0) {
        console.log("\n✅ Tickets table exists in database");

        // Check table structure
        const columnsResult = await client`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'tickets'
          ORDER BY ordinal_position
        `;

        console.log(`   Table has ${columnsResult.length} columns:`);
        columnsResult.forEach((col: Record<string, string>) => {
          console.log(`     - ${col.column_name} (${col.data_type})`);
        });

        // Check if there are any tickets
        const countResult = await client`SELECT COUNT(*) as count FROM tickets`;
        console.log(`\n   Current tickets in database: ${countResult[0]?.count || 0}`);
      } else {
        console.log("\n⚠️  Tickets table does NOT exist");
        console.log("   Run migration:");
        console.log("      npm run db:push        (for Drizzle)");
      }
    } catch (error) {
      console.log("\n⚠️  Could not check for tickets table:", error instanceof Error ? error.message : error);
    }

    await client.end();

    console.log("\n✅ Database connection test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    console.error("Error:", error instanceof Error ? error.message : error);

    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 Tip: Make sure your database server is running");
    } else if (error instanceof Error && error.message.includes("authentication")) {
      console.error("\n💡 Tip: Check your DATABASE_URL credentials");
    }

    process.exit(1);
  }
}

testConnection();
�*cascade08"(9e5eeb2aebf89cfd6e8ea6868d5398c0d7e68c492Dfile:///c:/Users/HP/Desktop/pro_hirana/scripts/test-db-connection.ts:&file:///c:/Users/HP/Desktop/pro_hirana