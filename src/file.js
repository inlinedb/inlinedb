const fs = require('fs');

const getIDBLocation = dbName => `./${dbName}/.idb`;

const fileExists = location => {

  try {

    return fs.statSync(location).isFile();

  } catch (e) {

    return false;

  }

};

const doesIDBExist = dbName =>
  fileExists(getIDBLocation(dbName));

module.exports = {
  doesIDBExist
};
