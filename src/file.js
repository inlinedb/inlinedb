const fs = require('fs');

const getIDBLocation = idbName => `./${idbName}/.idb`;
const getTableLocation = (idbName, tableName) => `./${idbName}/${tableName}/.table`;

const fileAsyncHandler = (resolve, reject) =>
  (err, data) => {

    if (err) {

      return reject(err);

    }

    return resolve(data);

  };

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

const saveTable = (idbName, tableName, tableData) =>
  new Promise((resolve, reject) =>
    fs.writeFile(
      getTableLocation(idbName, tableName),
      JSON.stringify(tableData),
      fileAsyncHandler(resolve, reject)
    )
  );

const loadTable = (idbName, tableName) =>
  new Promise((resolve, reject) =>
    fs.readFile(
      getTableLocation(idbName, tableName),
      fileAsyncHandler(resolve, reject)
    ))
    .then(data => JSON.parse(data.toString()));

const doesIDBExist = idbName =>
  fileExists(getIDBLocation(idbName));

module.exports = {
  doesIDBExist,
  loadIDB,
  loadTable,
  saveIDB,
  saveTable
};
