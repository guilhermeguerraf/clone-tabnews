import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import controller from "infra/controller.js";
import database from "infra/database.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  dryRun: true,
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  let databaseClient;

  try {
    databaseClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: databaseClient,
    });

    return response.status(200).json(pendingMigrations);
  } finally {
    await databaseClient.end();
  }
}

async function postHandler(request, response) {
  let databaseClient;

  try {
    databaseClient = await database.getNewClient();

    const performedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: databaseClient,
      dryRun: false,
    });

    if (performedMigrations.length > 0) {
      return response.status(201).json(performedMigrations);
    }

    return response.status(200).json(performedMigrations);
  } finally {
    await databaseClient.end();
  }
}
