const assert = require('assert');
const file = require('./file');
const query = require('./query');
const filter = require('./filter.js');
const validation = require('./validation.js');

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

    return this;

  }

  insert(...rows) {

    assert(rows.length > 0, validation.errors.rowsRequired(rows.length));
    rows.forEach(validation.test.toBeAnObject);

    tableQueries.get(this).push({
      rows,
      type: query.types.INSERT
    });

    return this;

  }

  query(criteria) {

    return file.loadTable(this.idbName, this.tableName)
      .then(data => filter.toFunction(criteria)(data));

  }

  revert() {

    tableQueries.set(this, []);

    return this;

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

    assert.strictEqual(typeof update, 'function', validation.errors.updateShouldBeAFunction(update));

    validation.test.toNotMutateRows(update);
    validation.test.toReturnAnObject(update);

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

    return this;

  }

}

module.exports = {
  Table
};
