const file = require('./file');
const query = require('./query');
const filter = require('./filter.js');

const tableQueries = new WeakMap();

class Table {

  constructor(idbName, tableName) {

    this.idbName = idbName;
    this.tableName = tableName;

    tableQueries.set(this, []);

  }

  delete(criteria = () => true) {

    tableQueries.get(this)
      .push(filter.map(
        criteria,
        {
          shouldDelete: criteria,
          type: query.types.DELETE_BY_FILTER
        },
        {
          ids: [].concat(criteria),
          type: query.types.DELETE_BY_IDS
        }
      ));

  }

  insert(...rows) {

    tableQueries.get(this).push({
      rows,
      type: query.types.INSERT
    });

  }

  query(criteria) {

    return file.loadTable(this.idbName, this.tableName)
      .then(data => filter.toFunction(criteria)(data));

  }

  revert() {

    tableQueries.set(this, []);

  }

  save() {

    const emptyData = {
      index: {},
      lastInsertId: 0,
      rows: []
    };

    return file.loadTable(this.idbName, this.tableName)
      .then(
        data => query.run(tableQueries.get(this), data),
        () => query.run(tableQueries.get(this), emptyData)
      )
      .then(updatedData => {

        tableQueries.set(this, []);

        return updatedData;

      })
      .then(updatedData => file.saveTable(
        this.idbName,
        this.tableName,
        updatedData
      ));

  }

  update(update, criteria = () => true) {

    tableQueries.get(this)
      .push(filter.map(
        criteria,
        {
          shouldUpdate: criteria,
          type: query.types.UPDATE_BY_FILTER,
          update
        },
        {
          ids: [].concat(criteria),
          type: query.types.UPDATE_BY_IDS,
          update
        }
      ));

  }

}

module.exports = {
  Table
};
