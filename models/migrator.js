import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import database from "infra/database.js";

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  dryRun: true,
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let databaseClient;

  try {
    databaseClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: databaseClient,
    });

    return pendingMigrations;
  } finally {
    await databaseClient?.end();
  }
}

async function runPendingMigrations() {
  let databaseClient;

  try {
    databaseClient = await database.getNewClient();

    const performedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: databaseClient,
      dryRun: false,
    });

    return performedMigrations;
  } finally {
    await databaseClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
