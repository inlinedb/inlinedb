const fs = require('fs');

const getIDBLocation = idbName => `./${idbName}/.idb`;

const fileExists = location => {

  try {

    return fs.statSync(location).isFile();

  } catch (e) {

    return false;

  }

};

const loadIDB = idbName => {

  const location = getIDBLocation(idbName);
  const data = fs.readFileSync(location).toString();

  return JSON.parse(data);

};

const saveIDB = (idbName, idbConfig) => fs.writeFileSync(getIDBLocation(idbName), JSON.stringify(idbConfig));

const doesIDBExist = idbName =>
  fileExists(getIDBLocation(idbName));

module.exports = {
  doesIDBExist,
  loadIDB,
  saveIDB
};
