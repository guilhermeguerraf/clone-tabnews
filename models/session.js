import crypto from "node:crypto";

import database from "infra/database.js";

// 30 days
const EXPIRATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000;

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const newSession = await runInsertQuery(userId, token);

  return newSession;

  async function runInsertQuery(userId, token) {
    const results = await database.query({
      text: `
        INSERT INTO
          sessions (user_id, token, expires_at)
        VALUES
          ($1, $2, timezone('utc', now()) + INTERVAL '30 days')
        RETURNING
          *
        ;
      `,
      values: [userId, token],
    });

    return results.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
