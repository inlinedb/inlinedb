const {expect} = require('code');
const query = require('../src/query');

describe('query', () => {

  it('should have query types', () => {

    expect(query.types).equals({
      DELETE: 'DELETE',
      INSERT: 'INSERT',
      UPDATE: 'UPDATE'
    });

  });

  it('should have a function to run queries', () => {

    const queries = [];
    const data = {rows: []};

    expect(query.run(queries, data)).equals(data);

  });

});
