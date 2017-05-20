const file = require('../src/file');
const {expect} = require('chai');
const fs = require('fs');
const sinon = require('sinon');

describe('file', () => {

  const dbName = 'db-name';
  let sandbox;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();

    sandbox.stub(fs, 'statSync');

  });

  afterEach(() => sandbox.restore());

  describe('when checking if idb exists', () => {

    const isFile = true;
    let stats;

    beforeEach(() => {

      stats = {isFile: sandbox.stub().returns(isFile)};

      fs.statSync.returns(stats);

    });

    it('should get file stats', () => {

      file.doesIDBExist(dbName);

      const location = `./${dbName}/.idb`;

      sinon.assert.calledOnce(fs.statSync);
      sinon.assert.calledWithExactly(fs.statSync, location);

    });

    it('should check if it is a file', () => {

      file.doesIDBExist(dbName);

      sinon.assert.calledOnce(stats.isFile);
      sinon.assert.calledWithExactly(stats.isFile);

    });

    it('should return true if file exists', () => {

      const doesIDBExist = file.doesIDBExist(dbName);

      expect(doesIDBExist).to.equal(isFile);

    });

    it('should return false if file does not exist', () => {

      fs.statSync.throws();

      const doesIDBExist = file.doesIDBExist(dbName);

      expect(doesIDBExist).to.equal(false);

    });

  });

});
