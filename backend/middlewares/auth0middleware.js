function auth0Domain() {
  return String(process.env.AUTH0_DOMAIN || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

async function verifyAuth0Token(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Auth0 access token is required" });
    }

    const domain = auth0Domain();
    if (!domain) throw new Error("AUTH0_DOMAIN is required");

    const response = await fetch(`https://${domain}/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Auth0 rejected the access token" });
    }

    req.auth0User = await response.json();
    return next();
  } catch (error) {
    console.error("Auth0 verification failed:", error.message);
    return res.status(401).json({
      error: process.env.NODE_ENV === "production"
        ? "Could not verify Auth0 login"
        : `Auth0 verification failed: ${error.message}`,
    });
  }
}

module.exports = { verifyAuth0Token };
