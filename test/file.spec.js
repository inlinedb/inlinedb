const file = require('../src/file');
const {expect} = require('code');
const fs = require('fs');
const sinon = require('sinon');

describe('file', () => {

  const idbName = 'db-name';
  const tableName = 'table-name';
  let sandbox;

  beforeEach(() => sandbox = sinon.sandbox.create());

  afterEach(() => sandbox.restore());

  describe('when checking if idb exists', () => {

    const isFile = true;
    let stats;

    beforeEach(() => {

      stats = {isFile: sandbox.stub().returns(isFile)};

      sandbox.stub(fs, 'statSync').returns(stats);

    });

    it('should get file stats', () => {

      file.doesIDBExist(idbName);

      const location = `./${idbName}/.idb`;

      sinon.assert.calledOnce(fs.statSync);
      sinon.assert.calledWithExactly(fs.statSync, location);

    });

    it('should check if it is a file', () => {

      file.doesIDBExist(idbName);

      sinon.assert.calledOnce(stats.isFile);
      sinon.assert.calledWithExactly(stats.isFile);

    });

    it('should return true if file exists', () => {

      const doesIDBExist = file.doesIDBExist(idbName);

      expect(doesIDBExist).to.equal(isFile);

    });

    it('should return false if file does not exist', () => {

      fs.statSync.throws();

      const doesIDBExist = file.doesIDBExist(idbName);

      expect(doesIDBExist).to.be.false();

    });

  });

  describe('when loading idb configuration', () => {

    const idbConfig = new Buffer('{"config": "config"}');
    const location = `./${idbName}/.idb`;
    let config;

    beforeEach(() => {

      sandbox.stub(fs, 'readFileSync')
        .withArgs(location)
        .returns(idbConfig);

      config = file.loadIDB(idbName);

    });

    it('should read the idb file', () => {

      sinon.assert.calledOnce(fs.readFileSync);
      sinon.assert.calledWithExactly(fs.readFileSync, location);

    });

    it('should return parsed config', () => {

      const expectedConfig = {
        config: 'config'
      };

      expect(config).to.equal(expectedConfig);

    });

  });

  describe('when saving idb configuration', () => {

    const idbConfig = {config: 'config'};
    const location = `./${idbName}/.idb`;

    beforeEach(() => {

      sandbox.stub(fs, 'writeFileSync');

      file.saveIDB(idbName, idbConfig);

    });

    it('should write it to a file', () => {

      sinon.assert.calledOnce(fs.writeFileSync);
      sinon.assert.calledWithExactly(fs.writeFileSync, location, JSON.stringify(idbConfig));

    });

  });

  describe('when saving idb configuration', () => {

    const idbConfig = {config: 'config'};
    const location = `./${idbName}/${tableName}/.idb`;

    beforeEach(() => sandbox.stub(fs, 'writeFile'));

    it('should write it to a file', () => {

      file.saveTable(idbName, tableName, idbConfig);

      sinon.assert.calledOnce(fs.writeFile);
      sinon.assert.calledWithExactly(fs.writeFile, location, JSON.stringify(idbConfig), sinon.match.func);

    });

    it('should return a promise', () => {

      const saveTable = file.saveTable(idbName, tableName, idbConfig);

      expect(saveTable).instanceOf(Promise);

    });

    it('should resolve if there is no error', async () => {

      fs.writeFile.callsArg(2);

      const err = await file.saveTable(idbName, tableName, idbConfig);

      expect(err).not.exists();

    });

    it('should reject if there is an error', async () => {

      const fileError = 'error';
      let err;

      fs.writeFile.callsArgWith(2, fileError);

      try {

        err = await file.saveTable(idbName, tableName, idbConfig);

      } catch (error) {

        err = error;

      } finally {

        expect(err).equals(fileError);

      }

    });

  });

});
