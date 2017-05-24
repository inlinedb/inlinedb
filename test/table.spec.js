const {Table} = require('../src/table');
const {expect} = require('code');
const file = require('../src/file');
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

    beforeEach(() => {

      tableData = {
        index: {
          10: 0,
          20: 2,
          30: 1
        },
        rows: [
          {
            $idbID: 10,
            column: 'column awesome'
          },
          {
            $idbID: 30,
            column: 'column match'
          },
          {
            $idbID: 20,
            column: 'column random'
          }
        ]
      };

      file.loadTable.returns(Promise.resolve(tableData));

    });

    it('should load the table', () => {

      table.query();

      sinon.assert.calledOnce(file.loadTable);
      sinon.assert.calledWithExactly(file.loadTable, idbName, tableName);

    });

    it('should return all the rows when there is no filter', async () => {

      const result = await table.query();

      expect(result).to.equal(tableData.rows);

    });

    it('should return the rows satisfied by a filter function', async () => {

      const filterFunction = row => row.column === 'column match';
      const result = await table.query(filterFunction);
      const expectedRows = [
        tableData.rows[1]
      ];

      expect(result).to.equal(expectedRows);

    });

    it('should return the row with matching id', async () => {

      const id = 10;
      const result = await table.query(id);
      const expectedRows = [
        tableData.rows[0]
      ];

      expect(result).to.equal(expectedRows);

    });

    it('should return the rows with matching ids', async () => {

      const id1 = 10;
      const id2 = 20;
      const result = await table.query([id1, id2]);
      const expectedRows = [
        tableData.rows[0],
        tableData.rows[2]
      ];

      expect(result).to.equal(expectedRows);

    });

  });

});
