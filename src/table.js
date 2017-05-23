const file = require('./file');

class Table {

  constructor(idbName, tableName) {

    this.idbName = idbName;
    this.tableName = tableName;
    this.data = {
      index: {},
      rows: []
    };

  }

  save() {

    return file.saveTable(
      this.idbName,
      this.tableName,
      this.data
    );

  }

}

module.exports = {
  Table
};
