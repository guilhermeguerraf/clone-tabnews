import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  console.log("Just for testing staging environment");

  const databaseClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: databaseClient,
    dir: join("infra", "migrations"),
    direction: "up",
    dryRun: true,
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    await databaseClient.end();

    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const performedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    await databaseClient.end();

    if (performedMigrations.length > 0) {
      return response.status(201).json(performedMigrations);
    }

    return response.status(200).json(performedMigrations);
  }

  return response.status(405).end();
}
