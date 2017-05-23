const {Table} = require('../src/table');
const {expect} = require('code');
const file = require('../src/file');
const query = require('../src/query');
const sinon = require('sinon');

describe('Table', () => {

  const idbName = 'db-name';
  const tableName = 'table-name';
  let sandbox,
    table;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();
    table = new Table(idbName, tableName);

    sandbox.stub(file);
    sandbox.stub(query);

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    expect(table).to.be.object();

  });

  describe('on saving', () => {

    let tableData,
      loadTable,
      saveTable,
      updatedTableData;

    beforeEach(() => {

      tableData = {rows: []};
      updatedTableData = {rows: ['updated']};

      loadTable = Promise.resolve(tableData);
      saveTable = Promise.resolve();

      file.saveTable.returns(saveTable);
      file.loadTable.returns(loadTable);

      query.run.returns(updatedTableData);

    });

    it('should return a promise', () => {

      expect(table.save()).instanceOf(Promise).equals(saveTable);

    });

    it('should load table data', () => {

      table.save();

      sinon.assert.calledOnce(file.loadTable);
      sinon.assert.calledWithExactly(file.loadTable, idbName, tableName);

    });

    it('should run the queries yet', () => {

      sinon.assert.notCalled(query.run);

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

});
