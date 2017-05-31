const assert = require('assert');
const idb = require('./idb');
const table = require('./table');
const file = require('./file');
const validation = require('./validation');

class Database {

  constructor(idbName) {

    assert.equal(typeof idbName, 'string', validation.errors.databaseNameShouldBeString(idbName));
    assert(validation.test.toHaveValidFilename(idbName), validation.errors.invalidFilename(idbName));

    this.idbConfig = new idb.IDB(idbName);

  }

  createTable(tableName) {

    assert.equal(typeof tableName, 'string', validation.errors.databaseNameShouldBeString(tableName));
    assert(validation.test.toHaveValidFilename(tableName), validation.errors.invalidFilename(tableName));

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

  listTables() {

    return Object.keys(this.idbConfig.tables);

  }

}

module.exports = {
  Database
};
