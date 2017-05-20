const {Database} = require('../src/database');
const {expect} = require('chai');
const idb = require('../src/idb');
const sinon = require('sinon');

describe('Database', () => {

  const dbName = 'db-name';
  const idbConfig = {};
  let database,
    sandbox;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();

    sandbox.stub(idb, 'IDB').returns(idbConfig);

    database = new Database(dbName);

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    expect(database).to.be.an('object');

  });

  it('should create a new idb configuration', () => {

    sinon.assert.calledOnce(idb.IDB);
    sinon.assert.calledWithExactly(idb.IDB, dbName);
    sinon.assert.calledWithNew(idb.IDB);

    expect(database.idbConfig).to.equal(idbConfig);

  });

});
