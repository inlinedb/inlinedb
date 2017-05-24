const mkdirp = require('mkdirp');
const file = require('./file');

class IDB {

  constructor(idbName) {

    this.idbName = idbName;
    this.tables = {};

    this.loadConfig(idbName);

  }

  loadConfig(idbName) {

    if (file.doesIDBExist(idbName)) {

      Object.assign(this, file.loadIDB(idbName));

    } else {

      mkdirp.sync(idbName);

      this.save();

    }

  }

  save() {

    file.saveIDB(this.idbName, this);

  }

  createTable(tableName) {

    if (!this.tables[tableName]) {

      this.tables[tableName] = {
        lastInsertId: 0
      };

      this.save();

    }

  }

}

module.exports = {
  IDB
};
