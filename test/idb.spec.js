const {IDB} = require('../src/idb');
const {expect} = require('chai');
const mkdirp = require('mkdirp');
const sinon = require('sinon');

describe('IDB', () => {

  const dbName = 'db-name';
  let idb,
    sandbox;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();

    sandbox.stub(mkdirp, 'sync');

    idb = new IDB(dbName);

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    expect(idb).to.be.an('object');

  });

  it('should sync database folder', () => {

    sinon.assert.calledOnce(mkdirp.sync);
    sinon.assert.calledWithExactly(mkdirp.sync, dbName);

  });

});
