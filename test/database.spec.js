const {expect} = require('chai');
const {Database} = require('../src/database');

describe('Database', () => {

  let database;

  beforeEach(() => {

    database = new Database();

  });

  it('should be initialized and used as object', () => {

    expect(database).to.be.an('object');

  });

});
