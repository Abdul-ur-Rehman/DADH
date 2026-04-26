const jwt = require("jsonwebtoken");

const generateToken = async (data, next) => {
  try {
    const token = await jwt.sign({ data }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
  } catch (err) {
    next(err);
  }
};

module.exports = generateToken;
