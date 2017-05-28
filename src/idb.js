const mkdirp = require('mkdirp');
const file = require('./file');

class IDB {

  constructor(idbName) {

    this.idbName = idbName;
    this.tables = {};

    this.loadConfig(idbName);

  }

  createTable(tableName) {

    if (!this.tables[tableName]) {

      this.tables[tableName] = {};

      this.save();

    }

  }

  dropTable(tableName) {

    delete this.tables[tableName];

    this.save();

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

}

module.exports = {
  IDB
};
