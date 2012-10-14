module.exports = process.env.CONNECT_COV
  ? require('./lib-cov/single-logon')
  : require('./lib/single-logon');
