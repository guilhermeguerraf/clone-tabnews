import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeEach(resetDatabase);

async function resetDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("POST to /api/v1/migrations should return 200 if no migrations have been performed", async () => {
  await fetch("http://localhost:3000/api/v1/migrations", {
    method: "post",
  });

  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "post",
  });

  expect(response.status).toBe(200);
});

test("POST to /api/v1/migrations should return 201 if at least one migration has been performed", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "post",
  });

  expect(response.status).toBe(201);
});

test("POST to /api/v1/migrations should return an array", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "post",
  });

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toBe(true);
});

test("POST to /api/v1/migrations should perform the pending migrations", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "post",
  });

  const responseBody1 = await response1.json();

  expect(responseBody1.length).toBeGreaterThan(0);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "post",
  });

  const responseBody2 = await response2.json();

  expect(responseBody2.length).toBe(0);
});
