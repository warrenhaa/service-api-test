const { v4: uuidV4 } = require('uuid');

const getRandomString = function () {
  const uid = uuidV4();
  const rval = uid.toString();
  return rval;
};

module.exports = { getRandomString };
