const User = require("../models/User");
const jwt = require("jsonwebtoken");

const SESSION_COOKIE = "courseai_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

function startSession(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(SESSION_COOKIE, token, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
}

async function registerUser(req, res) {
  const name = String(req.body?.name || "").trim().slice(0, 100);
  const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 254);
  const password = String(req.body?.password || "").slice(0, 128);

  if (name.length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters" });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  if (await User.exists({ email })) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const user = await User.create({ name, email, password });
  return res.status(201).json(startSession(res, user));
}

async function loginUser(req, res) {
  const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 254);
  const password = String(req.body?.password || "").slice(0, 128);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  return res.json(startSession(res, user));
}

async function auth0Sync(req, res) {
  const identity = req.auth0User;
  const email = String(identity?.email || "").trim().toLowerCase().slice(0, 254);
  const name = String(identity?.name || identity?.nickname || "").trim().slice(0, 100) || "User";
  const auth0Id = identity?.sub;

  if (!email || !auth0Id || identity.email_verified !== true) {
    return res.status(400).json({ error: "Auth0 account must have a verified email address" });
  }

  let user = await User.findOne({ auth0Id });

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      user.auth0Id = auth0Id;
    } else {
      user = new User({ name, email, auth0Id });
    }
  }

  user.name = user.name || name;
  await user.save();

  return res.json(startSession(res, user));
}

function getCurrentUser(req, res) {
  return res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
}

function logoutUser(_req, res) {
  res.clearCookie(SESSION_COOKIE, COOKIE_OPTIONS);
  return res.status(204).send();
}

module.exports = {
  registerUser,
  loginUser,
  auth0Sync,
  getCurrentUser,
  logoutUser,
};
