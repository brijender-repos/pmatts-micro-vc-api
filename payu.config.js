const Payu = require('payu-websdk');

const payu_key = process.env.PAYU_MERCHANT_KEY;
const payu_salt = process.env.PAYU_MERCHANT_SALT;

const payuClient = new Payu(
  {
    key: payu_key,
    salt: payu_salt,
  },
  process.env.PAYU_ENVIRONMENT
);

exports.PayData = {
  payuClient: payuClient,
  payu_key,
  payu_salt,
};
