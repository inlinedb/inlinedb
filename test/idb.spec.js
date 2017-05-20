const {IDB} = require('../src/idb');
const {expect} = require('code');
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
    sandbox.stub(file);

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    idb = new IDB(dbName);

    expect(idb).to.be.object();

  });

  it('should check if file exists', () => {

    new IDB(dbName);

    sinon.assert.calledOnce(file.doesIDBExist);
    sinon.assert.calledWithExactly(file.doesIDBExist, dbName);

  });

  describe('when idb exists', () => {

    let idbConfig;

    beforeEach(() => {

      idbConfig = {config: 'config'};

      file.loadIDB.returns(idbConfig);
      file.doesIDBExist.returns(true);

      idb = new IDB(dbName);

    });

    it('should not sync database folder', () => {

      sinon.assert.notCalled(mkdirp.sync);

    });

    it('should load the idb configuration', () => {

      sinon.assert.calledOnce(file.loadIDB);
      sinon.assert.calledWithExactly(file.loadIDB, dbName);

    });

    it('should merge the configuration with idb', () => {

      expect(idb).to.include(idbConfig);

    });

  });

  describe('when idb does not exist', () => {

    const defaultConfig = {
      dbName,
      tables: []
    };

    beforeEach(() => {

      file.doesIDBExist.returns(false);

      idb = new IDB(dbName);

    });

    it('should sync database folder', () => {

      sinon.assert.calledOnce(mkdirp.sync);
      sinon.assert.calledWithExactly(mkdirp.sync, dbName);

    });

    it('should have a default configuration', () => {

      expect(idb).to.include(defaultConfig);

    });

    it('should save the default configuration', () => {

      sinon.assert.calledOnce(file.saveIDB);
      sinon.assert.calledWithExactly(file.saveIDB, dbName, defaultConfig);

    });

  });

});
