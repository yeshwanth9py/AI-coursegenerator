const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setSessionCookie(res, token) {
  res.cookie("courseai_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
  };
}

function createSessionResponse(res, user) {
  const token = generateToken(user._id);
  setSessionCookie(res, token);

  return {
    ...publicUser(user),
    token,
  };
}

const registerUser = async (req, res, next) => {
  const name = String(req.body?.name || "").trim().slice(0, 100);
  const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 254);
  const password = String(req.body?.password || "");

  if (!name || !email || password.length < 8) {
    return res.status(400).json({ error: "Name, email, and a password of at least 8 characters are required" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(409).json({ error: "User already exists" });

    const user = await User.create({ name, email, password, authProvider: "local" });
    return res.status(201).json(createSessionResponse(res, user));
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.json(createSessionResponse(res, user));
  } catch (error) {
    return next(error);
  }
};

const auth0Sync = async (req, res, next) => {
  const identity = req.auth0User;
  const email = String(identity?.email || "").trim().toLowerCase();
  const auth0Id = identity?.sub;

  if (!email || !auth0Id || identity.email_verified !== true) {
    return res.status(400).json({ error: "Auth0 account must have a verified email address" });
  }

  try {
    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.auth0Id = auth0Id;
        user.authProvider = "auth0";
      } else {
        user = new User({
          name: identity.name || identity.nickname || "User",
          email,
          auth0Id,
          authProvider: "auth0",
        });
      }
    }

    user.name = user.name || identity.name || identity.nickname || "User";
    user.picture = identity.picture || user.picture;
    await user.save();

    return res.json(createSessionResponse(res, user));
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res) => {
  return res.json(publicUser(req.user));
};

const logoutUser = async (req, res) => {
  res.clearCookie("courseai_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  return res.status(204).send();
};

module.exports = {
  registerUser,
  loginUser,
  auth0Sync,
  getCurrentUser,
  logoutUser,
};
