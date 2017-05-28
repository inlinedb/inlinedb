const fs = require('fs');
const rimraf = require('rimraf');

const getIDBLocation = idbName => `./${idbName}/.idb`;
const getTableLocation = (idbName, tableName) => `./${idbName}/${tableName}.table`;

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

const deleteTable = (idbName, tableName) =>
  rimraf.sync(getTableLocation(idbName, tableName));

const doesIDBExist = idbName =>
  fileExists(getIDBLocation(idbName));

const loadIDB = idbName => {

  const location = getIDBLocation(idbName);
  const data = fs.readFileSync(location).toString();

  return JSON.parse(data);

};

const loadTable = (idbName, tableName) =>
  new Promise((resolve, reject) =>
    fs.readFile(
      getTableLocation(idbName, tableName),
      fileAsyncHandler(resolve, reject)
    ))
    .then(data => JSON.parse(data.toString()));

const saveIDB = (idbName, idbConfig) => fs.writeFileSync(getIDBLocation(idbName), JSON.stringify(idbConfig));

const saveTable = (idbName, tableName, tableData) =>
  new Promise((resolve, reject) =>
    fs.writeFile(
      getTableLocation(idbName, tableName),
      JSON.stringify(tableData),
      fileAsyncHandler(resolve, reject)
    )
  );

module.exports = {
  deleteTable,
  doesIDBExist,
  loadIDB,
  loadTable,
  saveIDB,
  saveTable
};
