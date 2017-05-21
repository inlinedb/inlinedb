const idb = require('./idb');
const table = require('./table');

class Database {

  constructor(idbName) {

    this.idbConfig = new idb.IDB(idbName);

  }

  createTable(tableName) {

    this.idbConfig.createTable(tableName);

    return new table.Table(tableName);

  }

}

module.exports = {
  Database
};
