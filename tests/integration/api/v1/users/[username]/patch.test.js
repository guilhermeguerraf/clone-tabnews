import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator.js";
import password from "models/password.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "OutroUsername",
          }),
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With duplicated username", async () => {
      await orchestrator.createUser({
        username: "UsernameDuplicado1",
      });

      await orchestrator.createUser({
        username: "UsernameDuplicado2",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsernameDuplicado1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "UsernameDuplicado2",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With same username", async () => {
      const user1 = await orchestrator.createUser({
        username: "mesmousername",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/mesmousername",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "MesmoUsername",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MesmoUsername",
        email: user1.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With duplicated email", async () => {
      const user1 = await orchestrator.createUser({
        email: "duplicado1@example.test",
      });

      await orchestrator.createUser({
        email: "duplicado2@example.test",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "duplicado2@example.test",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("With unique username", async () => {
      const user1 = await orchestrator.createUser({
        username: "UsernameUnico1",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsernameUnico1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "UsernameUnico2",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "UsernameUnico2",
        email: user1.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique email", async () => {
      const user1 = await orchestrator.createUser({
        email: "emailunico1@example.test",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "emailunico2@example.test",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user1.username,
        email: "emailunico2@example.test",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new password", async () => {
      const user1 = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${user1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "novasenha",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user1.username,
        email: user1.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(responseBody.created_at).not.toBeNaN();
      expect(responseBody.updated_at).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findByUsername(user1.username);
      const correctHashMatch = await password.compare(
        "novasenha",
        userInDatabase.password,
      );

      expect(correctHashMatch).toBe(true);

      const incorrectHashMatch = await password.compare(
        "senhaerrada",
        userInDatabase.password,
      );

      expect(incorrectHashMatch).toBe(false);
    });
  });
});
