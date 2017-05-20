const {expect} = require('chai');
const {Table} = require('../src/table');

describe('Table', () => {

  let table;

  beforeEach(() => {

    table = new Table();

  });

  it('should be initialized and used as object', () => {

    expect(table).to.be.an('object');

  });

});
