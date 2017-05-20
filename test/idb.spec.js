const {IDB} = require('../src/idb');
const {expect} = require('chai');
const file = require('../src/file');
const mkdirp = require('mkdirp');
const sinon = require('sinon');

describe('IDB', () => {

  const dbName = 'db-name';
  let idb,
    sandbox;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();

    sandbox.stub(mkdirp, 'sync');
    sandbox.stub(file, 'doesIDBExist');

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    idb = new IDB(dbName);

    expect(idb).to.be.an('object');

  });

  it('should check if file exists', () => {

    new IDB(dbName);

    sinon.assert.calledOnce(file.doesIDBExist);
    sinon.assert.calledWithExactly(file.doesIDBExist, dbName);

  });

  describe('when idb exists', () => {

    it('should not sync database folder', () => {

      sinon.assert.notCalled(mkdirp.sync);

    });

  });

  describe('when idb does not exist', () => {

    beforeEach(() => {

      file.doesIDBExist.returns(false);

      idb = new IDB(dbName);

    });

    it('should sync database folder', () => {

      sinon.assert.calledOnce(mkdirp.sync);
      sinon.assert.calledWithExactly(mkdirp.sync, dbName);

    });

  });

});
