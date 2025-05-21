const cors = require('cors');
const config = require('../config');

const corsOptions = {
  origin: config.server.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

module.exports = cors(corsOptions); 