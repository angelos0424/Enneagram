const fs = require("node:fs");
const path = require("node:path");

const { Client } = require("pg");

const migrationsDir = path.resolve(__dirname, "../../drizzle");

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to apply database migrations.");
  }

  return databaseUrl;
}

function getMigrationFiles() {
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function applyMigrations() {
  const client = new Client({
    connectionString: getDatabaseUrl(),
  });

  await client.connect();

  try {
    for (const fileName of getMigrationFiles()) {
      const migrationPath = path.join(migrationsDir, fileName);
      const sql = fs.readFileSync(migrationPath, "utf8").trim();

      if (!sql) {
        continue;
      }

      process.stdout.write(`[db:migrate] applying ${fileName}\n`);
      await client.query(sql);
    }
  } finally {
    await client.end();
  }
}

applyMigrations().catch((error) => {
  process.stderr.write(`[db:migrate] ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
