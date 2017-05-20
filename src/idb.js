const mkdirp = require('mkdirp');
const file = require('./file');

class IDB {

  constructor(dbName) {

    this.loadConfig(dbName);

  }

  loadConfig(dbName) {

    if (file.doesIDBExist(dbName)) {

      Object.assign(this, file.loadIDB(dbName));

    } else {

      mkdirp.sync(dbName);

    }

  }

}

module.exports = {
  IDB
};
