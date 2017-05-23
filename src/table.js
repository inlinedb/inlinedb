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

    const emptyData = {
      index: {},
      rows: []
    };

    return file.loadTable(this.idbName, this.tableName)
      .then(
        data => query.run(tableQueries.get(this), data),
        () => query.run(tableQueries.get(this), emptyData)
      )
      .then(updatedData => file.saveTable(
        this.idbName,
        this.tableName,
        updatedData
      ));

  }

}

module.exports = {
  Table
};
