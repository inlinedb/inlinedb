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
      idbName,
      tables: {
        'table-1': {},
        'table-2': {}
      }
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

  describe('when dropping the database', () => {

    it('should delete the database', () => {

      database.drop();

      sinon.assert.calledOnce(file.deleteDatabase);
      sinon.assert.calledWithExactly(file.deleteDatabase, idbName);

    });

  });

  describe('when listing tables', () => {

    it('should return the list of tables in the idb', () => {

      const expectedTables = [
        'table-1',
        'table-2'
      ];

      expect(database.listTables()).to.equal(expectedTables);

    });

  });

  describe('validations', () => {

    describe('when initialising', () => {

      it('should throw error if idbName is not provided', () => {

        const expectedMessage = 'Expected database name to be a string, got undefined.';

        expect(() => new Database()).to.throw(expectedMessage);

      });

      it('should throw error if idbName is not a string', () => {

        const invalidIdbName = 123;
        const expectedMessage = 'Expected database name to be a string, got number.';

        expect(() => new Database(invalidIdbName)).to.throw(expectedMessage);

      });

      it('should throw error if idbName is not a valid name', () => {

        const invalidIdbName = 'test-';
        const expectedMessage = 'Expected test- to match [a-zA-Z0-9]+([-_][a-zA-Z0-9]+)* pattern.';

        expect(() => new Database(invalidIdbName)).to.throw(expectedMessage);

      });

    });

    describe('when creating table', () => {

      it('should throw error if table name is not provided', () => {

        const expectedMessage = 'Expected table name to be a string, got undefined.';

        expect(() => database.createTable()).to.throw(expectedMessage);

      });

      it('should throw error if table name is not a string', () => {

        const invalidIdbName = 123;
        const expectedMessage = 'Expected table name to be a string, got number.';

        expect(() => database.createTable(invalidIdbName)).to.throw(expectedMessage);

      });

      it('should throw error if table name is not a valid name', () => {

        const invalidIdbName = 'test-';
        const expectedMessage = 'Expected test- to match [a-zA-Z0-9]+([-_][a-zA-Z0-9]+)* pattern.';

        expect(() => database.createTable(invalidIdbName)).to.throw(expectedMessage);

      });

    });

  });

});
