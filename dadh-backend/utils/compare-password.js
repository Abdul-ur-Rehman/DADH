const bcrypt = require("bcrypt");

const comparePassword = (password, hashedPassword, next) => {
  try {
    const isMatch = bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    next(error);
  }
};

module.exports = comparePassword;
