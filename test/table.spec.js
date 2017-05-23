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

    let saveTable;

    beforeEach(() => {

      saveTable = Promise.resolve();

      file.saveTable.returns(saveTable);

    });

    it('should run queries', () => {

      const queries = [];

      table.save();

      sinon.assert.calledOnce(query.run);
      sinon.assert.calledWithExactly(query.run, queries);

    });

    it('should return a promise', () => {

      expect(table.save()).instanceOf(Promise).equals(saveTable);

    });

    it('should save the table', () => {

      table.save();

      const data = {
        index: {},
        rows: []
      };

      sinon.assert.calledOnce(file.saveTable);
      sinon.assert.calledWithExactly(file.saveTable, idbName, tableName, data);

    });

  });

});
