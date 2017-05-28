const idb = require('./idb');
const table = require('./table');
const file = require('./file');

class Database {

  constructor(idbName) {

    this.idbConfig = new idb.IDB(idbName);

  }

  createTable(tableName) {

    this.idbConfig.createTable(tableName);

    return new table.Table(this.idbConfig.idbName, tableName);

  }

  drop() {

    file.deleteDatabase(this.idbConfig.idbName);

  }

  dropTable(tableName) {

    this.idbConfig.dropTable(tableName);

    file.deleteTable(this.idbConfig.idbName, tableName);

  }

}

module.exports = {
  Database
};
