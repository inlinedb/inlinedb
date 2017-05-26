const {Table} = require('../src/table');
const {expect} = require('code');
const file = require('../src/file');
const filter = require('../src/filter');
const query = require('../src/query');
const sinon = require('sinon');

describe('Table', () => {

  const idbName = 'db-name';
  const tableName = 'table-name';
  let sandbox,
    table,
    tableData;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();
    tableData = {rows: []};

    table = new Table(idbName, tableName);

    sandbox.stub(file);
    sandbox.stub(filter);
    sandbox.stub(query);

    file.loadTable.returns(Promise.resolve(tableData));

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    expect(table).to.be.object();

  });

  describe('on saving', () => {

    let saveTable,
      updatedTableData;

    beforeEach(() => {

      updatedTableData = {rows: ['updated']};

      saveTable = Promise.resolve();

      file.saveTable.returns(saveTable);

      query.run.returns(updatedTableData);

    });

    it('should return a promise', () => {

      expect(table.save()).instanceOf(Promise).to.equal(saveTable);

    });

    it('should load table data', () => {

      table.save();

      sinon.assert.calledOnce(file.loadTable);
      sinon.assert.calledWithExactly(file.loadTable, idbName, tableName);

    });

    it('should not run the queries yet', () => {

      sinon.assert.notCalled(query.run);

    });

    it('should not save the tables yet', () => {

      sinon.assert.notCalled(file.saveTable);

    });

    describe('after loading the data', () => {

      beforeEach(async () => await table.save());

      it('should run queries', () => {

        const queries = [];

        sinon.assert.calledOnce(query.run);
        sinon.assert.calledWithExactly(query.run, queries, tableData);

      });

      it('should save the table', () => {

        sinon.assert.calledOnce(file.saveTable);
        sinon.assert.calledWithExactly(file.saveTable, idbName, tableName, updatedTableData);

      });

    });

    describe('after failing to load the data', () => {

      beforeEach(async () => {

        const error = 'table does not exist';

        file.loadTable.returns(Promise.reject(error));

        await table.save();

      });

      it('should run queries on empty data', () => {

        const queries = [];
        const emptyTableData = {
          index: {},
          lastInsertId: 0,
          rows: []
        };

        sinon.assert.calledOnce(query.run);
        sinon.assert.calledWithExactly(query.run, queries, emptyTableData);

      });

      it('should save the table', () => {

        sinon.assert.calledOnce(file.saveTable);
        sinon.assert.calledWithExactly(file.saveTable, idbName, tableName, updatedTableData);

      });

    });

  });

  describe('on inserting rows', () => {

    const row = {column: 'column'};

    it('should insert one row', async () => {

      const insertQuery = {
        rows: [row],
        type: query.types.INSERT
      };

      table.insert(row);

      await table.save();

      sinon.assert.calledOnce(query.run);
      sinon.assert.calledWithExactly(query.run, [insertQuery], tableData);

    });

    it('should insert array of rows', async () => {

      const insertQuery = {
        rows: [row, row],
        type: query.types.INSERT
      };

      table.insert(row, row);

      await table.save();

      sinon.assert.calledOnce(query.run);
      sinon.assert.calledWithExactly(query.run, [insertQuery], tableData);

    });

  });

  describe('on querying rows', () => {

    let filterFunction;

    beforeEach(() => {

      tableData = {
        index: {},
        rows: []
      };
      filterFunction = sandbox.spy(() => Symbol.for('rows'));

      file.loadTable.returns(Promise.resolve(tableData));
      filter.toFunction.returns(filterFunction);

    });

    it('should load the table', () => {

      table.query();

      sinon.assert.calledOnce(file.loadTable);
      sinon.assert.calledWithExactly(file.loadTable, idbName, tableName);

    });

    it('should convert the filter to a function', async () => {

      const criteria = 'filter';

      await table.query(criteria);

      sinon.assert.calledOnce(filter.toFunction);
      sinon.assert.calledWithExactly(filter.toFunction, criteria);

    });

    it('should filter the data using the filter function', async () => {

      await table.query();

      sinon.assert.calledOnce(filterFunction);
      sinon.assert.calledWithExactly(filterFunction, tableData);

    });

    it('should return the filtered data', async () => {

      const result = await table.query();
      const expectedResult = Symbol.for('rows');

      expect(result).to.equal(expectedResult);

    });

  });

});
