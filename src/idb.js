const mkdirp = require('mkdirp');
const file = require('./file');

const defaultConfig = {
  idbName: '',
  tables: []
};

class IDB {

  constructor(idbName) {

    this.loadConfig(idbName);

  }

  loadConfig(idbName) {

    if (file.doesIDBExist(idbName)) {

      Object.assign(this, file.loadIDB(idbName));

    } else {

      mkdirp.sync(idbName);

      const idbConfig = Object.assign(this, defaultConfig, {idbName});

      file.saveIDB(idbName, idbConfig);

    }

  }

}

module.exports = {
  IDB
};
