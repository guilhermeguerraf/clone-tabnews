import bcrypt from "bcryptjs";

async function hash(providedPassword) {
  const rounds = getNumberOfRounds();

  return await bcrypt.hash(providedPassword, rounds);

  function getNumberOfRounds() {
    return process.env.NODE_ENV === "production" ? 14 : 1;
  }
}

async function compare(providedPassword, hashedPassword) {
  return await bcrypt.compare(providedPassword, hashedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
