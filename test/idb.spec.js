const {IDB} = require('../src/idb');
const {expect} = require('code');
const file = require('../src/file');
const mkdirp = require('mkdirp');
const sinon = require('sinon');

describe('IDB', () => {

  const idbName = 'db-name';
  let idb,
    sandbox;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();

    sandbox.stub(mkdirp, 'sync');
    sandbox.stub(file);

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    idb = new IDB(idbName);

    expect(idb).to.be.object();

  });

  it('should check if file exists', () => {

    new IDB(idbName);

    sinon.assert.calledOnce(file.doesIDBExist);
    sinon.assert.calledWithExactly(file.doesIDBExist, idbName);

  });

  describe('when idb exists', () => {

    let idbConfig;

    beforeEach(() => {

      idbConfig = {config: 'config'};

      file.loadIDB.returns(idbConfig);
      file.doesIDBExist.returns(true);

      idb = new IDB(idbName);

    });

    it('should not sync database folder', () => {

      sinon.assert.notCalled(mkdirp.sync);

    });

    it('should load the idb configuration', () => {

      sinon.assert.calledOnce(file.loadIDB);
      sinon.assert.calledWithExactly(file.loadIDB, idbName);

    });

    it('should merge the configuration with idb', () => {

      expect(idb).to.include(idbConfig);

    });

  });

  describe('when idb does not exist', () => {

    const defaultConfig = {
      idbName,
      tables: []
    };

    beforeEach(() => {

      file.doesIDBExist.returns(false);

      idb = new IDB(idbName);

    });

    it('should sync database folder', () => {

      sinon.assert.calledOnce(mkdirp.sync);
      sinon.assert.calledWithExactly(mkdirp.sync, idbName);

    });

    it('should have a default configuration', () => {

      expect(idb).to.include(defaultConfig);

    });

    it('should save the default configuration', () => {

      sinon.assert.calledOnce(file.saveIDB);
      sinon.assert.calledWithExactly(file.saveIDB, idbName, defaultConfig);

    });

  });

});
