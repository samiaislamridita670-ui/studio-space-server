const crypto = require("crypto");

function verifyInternalRequest(req, res, next) {
  const configuredSecret = process.env.INTERNAL_API_SECRET;
  const receivedSecret = req.headers["x-internal-api-secret"];

  if (!configuredSecret || !receivedSecret) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request.",
    });
  }

  const expectedBuffer = Buffer.from(configuredSecret);
  const receivedBuffer = Buffer.from(String(receivedSecret));

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid internal authentication.",
    });
  }

  const userId = req.headers["x-authenticated-user-id"];
  const userName = req.headers["x-authenticated-user-name"];
  const userEmail = req.headers["x-authenticated-user-email"];

  if (
    typeof userId !== "string" || !userId.trim() ||
    typeof userName !== "string" || !userName.trim() ||
    typeof userEmail !== "string" || !userEmail.trim()
  ) {
    return res.status(401).json({
      success: false,
      message: "Authenticated user information is missing.",
    });
  }

  req.authenticatedUser = {
    id: userId,
    name: userName,
    email: userEmail.toLowerCase(),
  };

  next();
}

module.exports = verifyInternalRequest;
