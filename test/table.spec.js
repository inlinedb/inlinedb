const {expect} = require('code');
const {Table} = require('../src/table');
const sinon = require('sinon');
const file = require('../src/file');

describe('Table', () => {

  const idbName = 'db-name';
  const tableName = 'table-name';
  let sandbox,
    table;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();
    table = new Table(idbName, tableName);

    sandbox.stub(file);

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    expect(table).to.be.object();

  });

  describe('on saving', () => {

    beforeEach(() => {

      file.saveTable.returns(Promise.resolve());

    });

    it('should return a promise', () => {

      expect(table.save()).instanceOf(Promise);

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
