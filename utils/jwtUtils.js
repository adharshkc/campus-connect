const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/config');

/**
 * Generate a JWT token for a user
 * @param {Object} payload - Data to include in token
 * @returns {Promise<string>} JWT token
 */
const generateToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn }, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token
 */
const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken
};