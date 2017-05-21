const {Database} = require('../src/database');
const {expect} = require('code');
const idb = require('../src/idb');
const sinon = require('sinon');

describe('Database', () => {

  const idbName = 'db-name';
  const idbConfig = {};
  let database,
    sandbox;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();

    sandbox.stub(idb, 'IDB').returns(idbConfig);

    database = new Database(idbName);

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    expect(database).to.be.object();

  });

  it('should create a new idb configuration', () => {

    sinon.assert.calledOnce(idb.IDB);
    sinon.assert.calledWithExactly(idb.IDB, idbName);
    sinon.assert.calledWithNew(idb.IDB);

    expect(database.idbConfig).to.equal(idbConfig);

  });

});
