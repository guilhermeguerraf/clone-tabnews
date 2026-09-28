import { NotFoundError, UnauthorizedError } from "infra/errors.js";
import user from "models/user.js";
import password from "models/password.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const userFound = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, userFound.password);

    return userFound;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
      });
    }

    throw error;
  }

  async function findUserByEmail(email) {
    try {
      const userFound = await user.findByEmail(email);

      return userFound;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se este dado está correto.",
        });
      }

      throw error;
    }
  }

  async function validatePassword(providedPassword, storedPassword) {
    const validPassword = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!validPassword) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se este dado está correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
