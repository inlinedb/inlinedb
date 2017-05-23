const file = require('./file');

const tableData = new WeakMap();

class Table {

  constructor(idbName, tableName) {

    this.idbName = idbName;
    this.tableName = tableName;

    tableData.set(this, {
      index: {},
      rows: []
    });

  }

  save() {

    return file.saveTable(
      this.idbName,
      this.tableName,
      tableData.get(this)
    );

  }

}

module.exports = {
  Table
};
