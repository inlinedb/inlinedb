const idb = require('./idb');

class Database {

  constructor(dbName) {

    this.idbConfig = new idb.IDB(dbName);

  }

}

module.exports = {
  Database
};
