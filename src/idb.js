const mkdirp = require('mkdirp');
const file = require('./file');

class IDB {

  constructor(idbName) {

    this.loadConfig(idbName);

  }

  loadConfig(idbName) {

    if (file.doesIDBExist(idbName)) {

      Object.assign(this, file.loadIDB(idbName));

    } else {

      mkdirp.sync(idbName);

      Object.assign(this, {
        idbName,
        tables: {}
      });

      file.saveIDB(this.idbName, this);

    }

  }

  createTable(tableName) {

    if (!this.tables[tableName]) {

      this.tables[tableName] = {
        lastInsertId: 0
      };

      file.saveIDB(this.idbName, this);

    }

  }

}

module.exports = {
  IDB
};
