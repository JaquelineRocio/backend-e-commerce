import { expressjwt } from "express-jwt";

function authJwt() {
  const secret = process.env.SECRET;
  const api = process.env.API_URL;

  console.log("Secret:", secret);

  return expressjwt({
    secret,
    algorithms: ["HS256"],
    isRevoked, // Función de revocación corregida
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["GET", "OPTIONS", "POST"] },
      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}

// Función para revocar el token si es inválido (p.e., usuario bloqueado o lista negra)
async function isRevoked(req, token) {
  try {
    console.log("Token:", token);

    // Ejemplo: No revocar el token a menos que haya condiciones específicas
    if (!token.payload || !token.payload.userId) {
      return true; // Revoca si el token no tiene un ID de usuario válido
    }

    // Aquí puedes agregar lógica adicional, como verificar si el usuario está bloqueado
    // o si su token aparece en una lista negra.

    return false; // No revoca el token
  } catch (error) {
    console.error("Error in isRevoked function:", error.message);
    return true; // Si hay un error, revoca el token como medida de seguridad
  }
}

export default authJwt;
