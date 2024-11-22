import { expressjwt } from "express-jwt";

function authJwt() {
  const secret = process.env.SECRET;
  const api = process.env.API_URL;

  return expressjwt({
    secret,
    algorithms: ["HS256"],
    isRevoked,
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

async function isRevoked(req, token) {
  try {
    if (!token.payload.isAdmin) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error in isRevoked function:", error.message);
    return true;
  }
}

export default authJwt;
