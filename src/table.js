const file = require('./file');
const query = require('./query');

const tableData = new WeakMap();
const tableQueries = new WeakMap();

class Table {

  constructor(idbName, tableName) {

    this.idbName = idbName;
    this.tableName = tableName;

    tableData.set(this, {
      index: {},
      rows: []
    });
    tableQueries.set(this, []);

  }

  save() {

    query.run(tableQueries.get(this));

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
