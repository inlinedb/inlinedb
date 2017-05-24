const file = require('./file');
const query = require('./query');

const tableQueries = new WeakMap();

class Table {

  constructor(idbName, tableName) {

    this.idbName = idbName;
    this.tableName = tableName;

    tableQueries.set(this, []);

  }

  insert(...rows) {

    tableQueries.get(this).push({
      rows,
      type: query.types.INSERT
    });

  }

  query(filter = () => true) {

    return file.loadTable(this.idbName, this.tableName)
      .then(data => {

        let queriedData = [];

        if (typeof filter === 'function') {

          queriedData = data.rows.filter(filter);

        } else {

          queriedData = [].concat(filter).map($idbID =>
            data.rows[data.index[$idbID]]
          );

        }

        return queriedData;

      });

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
