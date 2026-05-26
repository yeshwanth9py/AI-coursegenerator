const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Sign a new token containing the user's ID
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


module.exports = generateToken;