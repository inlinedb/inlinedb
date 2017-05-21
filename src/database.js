const idb = require('./idb');

class Database {

  constructor(idbName) {

    this.idbConfig = new idb.IDB(idbName);

  }

}

module.exports = {
  Database
};
