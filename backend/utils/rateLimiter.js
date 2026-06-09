

//my custom rate limiter based on ip address

// Track requests in memory
const requestCounts = {};

// Configuration
const WINDOW_SIZE_IN_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 50; // Max 50 requests per minute per IP

const customRateLimiter = (req, res, next) => {
  // Identify the user by IP address (or req.user.id if authenticated)
  const identifier = req.ip;
  const now = Date.now();

  // If this is the user's first request, initialize their record
  if (!requestCounts[identifier]) {
    requestCounts[identifier] = { count: 1, startTime: now };
    return next();
  }

  const timePassed = now - requestCounts[identifier].startTime;

  // Check if we are still within the time window
  if (timePassed < WINDOW_SIZE_IN_MS) {
    if (requestCounts[identifier].count >= MAX_REQUESTS) {
      // Limit exceeded, reject the request
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again in a minute.",
      });
    }

    // Increment the counter and allow the request
    requestCounts[identifier].count++;
    return next();
  }

  // The time window has passed; reset the counter for a new window
  requestCounts[identifier] = { count: 1, startTime: now };
  return next();
};

module.exports = customRateLimiter;
