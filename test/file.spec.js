const file = require('../src/file');
const {expect} = require('chai');
const fs = require('fs');
const sinon = require('sinon');

describe('file', () => {

  const location = 'location';
  let sandbox;

  beforeEach(() => sandbox = sinon.sandbox.create());

  afterEach(() => sandbox.restore());

  describe('when checking if it exists', () => {

    const isFile = true;
    let stats;

    beforeEach(() => {

      stats = {isFile: sandbox.stub().returns(isFile)};

      sandbox.stub(fs, 'statSync').returns(stats);

    });

    it('should get file stats', () => {

      file.fileExists(location);

      sinon.assert.calledOnce(fs.statSync);
      sinon.assert.calledWithExactly(fs.statSync, location);

    });

    it('should check if it is a file', () => {

      file.fileExists(location);

      sinon.assert.calledOnce(stats.isFile);
      sinon.assert.calledWithExactly(stats.isFile);

    });

    it('should return true if file exists', () => {

      const fileExists = file.fileExists(location);

      expect(fileExists).to.equal(isFile);

    });

    it('should return false if file does not exist', () => {

      fs.statSync.throws();

      const fileExists = file.fileExists(location);

      expect(fileExists).to.equal(false);

    });

  });

});
