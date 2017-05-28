const {Database} = require('../src/database');
const IDB = require('../src/idb');
const Table = require('../src/table');
const {expect} = require('code');
const file = require('../src/file');
const sinon = require('sinon');

describe('Database', () => {

  const idbName = 'db-name';
  const tableName = 'table-name';
  let database,
    idbConfig,
    sandbox,
    table;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();

    idbConfig = {
      createTable: sandbox.stub(),
      dropTable: sandbox.stub(),
      idbName
    };

    table = {};

    sandbox.stub(IDB, 'IDB').returns(idbConfig);
    sandbox.stub(Table, 'Table').returns(table);
    sandbox.stub(file);

    database = new Database(idbName);

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    expect(database).to.be.object();

  });

  it('should create a new idb configuration', () => {

    sinon.assert.calledOnce(IDB.IDB);
    sinon.assert.calledWithExactly(IDB.IDB, idbName);
    sinon.assert.calledWithNew(IDB.IDB);

    expect(database.idbConfig).to.equal(idbConfig);

  });

  describe('when creating a table', () => {

    let iTable;

    beforeEach(() => iTable = database.createTable(tableName));

    it('should instantiate a new table', () => {

      sinon.assert.calledOnce(Table.Table);
      sinon.assert.calledWithExactly(Table.Table, idbName, tableName);
      sinon.assert.calledWithNew(Table.Table);

    });

    it('should return an instance of Table', () => {

      expect(iTable).to.equal(table);

    });

    it('should create a table in idb config', () => {

      sinon.assert.calledOnce(idbConfig.createTable);
      sinon.assert.calledWithExactly(idbConfig.createTable, tableName);

    });

  });

  describe('when dropping a table', () => {

    beforeEach(() => database.dropTable(tableName));

    it('should remove the table from idb config', () => {

      sinon.assert.calledOnce(idbConfig.dropTable);
      sinon.assert.calledWithExactly(idbConfig.dropTable, tableName);

    });

    it('should delete the table file', () => {

      sinon.assert.calledOnce(file.deleteTable);
      sinon.assert.calledWithExactly(file.deleteTable, idbName, tableName);

    });

  });

});
