'use strict';

process.env.AUSTACK_DATABASE_URL = process.env.AUSTACK_DATABASE_URL || 'mongodb://localhost:27017/austackdb';

module.exports = {

  corsOptions: {
    origin: '/austack\.com$/'
  },
  ip: process.env.AUSTACK_SYS_IP || undefined,

  port: process.env.AUSTACK_SYS_PORT || 9888,

  publicDir: 'public',

  mongo: {
    uri: process.env.AUSTACK_DATABASE_URL
  }
};
