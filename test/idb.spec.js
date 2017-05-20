const {expect} = require('chai');
const {IDB} = require('../src/idb');

describe('IDB', () => {

  let idb;

  beforeEach(() => {

    idb = new IDB();

  });

  it('should be initialized and used as object', () => {

    expect(idb).to.be.an('object');

  });

});
