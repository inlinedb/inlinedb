const mkdirp = require('mkdirp');
const file = require('./file');

const defaultConfig = {
  dbName: '',
  tables: []
};

class IDB {

  constructor(dbName) {

    this.loadConfig(dbName);

  }

  loadConfig(dbName) {

    if (file.doesIDBExist(dbName)) {

      Object.assign(this, file.loadIDB(dbName));

    } else {

      mkdirp.sync(dbName);

      const idbConfig = Object.assign(this, defaultConfig, {dbName});

      file.saveIDB(dbName, idbConfig);

    }

  }

}

module.exports = {
  IDB
};
