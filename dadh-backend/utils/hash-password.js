const bcrypt = require('bcryptjs');

const hashPassword = async (password,next) => {
    try {
        const saltRound = await bcrypt.genSalt(12);
        const hashed_password = await bcrypt.hash(password, saltRound)
        password = hashed_password
        return password
    }
    catch (err) {
        next(err)
    }
}

module.exports = hashPassword;