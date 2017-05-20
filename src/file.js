const fs = require('fs');

const getIDBLocation = dbName => `./${dbName}/.idb`;

const fileExists = location => {

  try {

    return fs.statSync(location).isFile();

  } catch (e) {

    return false;

  }

};

const loadIDB = dbName => {

  const location = getIDBLocation(dbName);
  const data = fs.readFileSync(location).toString();

  return JSON.parse(data);

};

const saveIDB = (dbName, idbConfig) => fs.writeFileSync(getIDBLocation(dbName), JSON.stringify(idbConfig));

const doesIDBExist = dbName =>
  fileExists(getIDBLocation(dbName));

module.exports = {
  doesIDBExist,
  loadIDB,
  saveIDB
};
