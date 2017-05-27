const {expect} = require('code');
const query = require('../src/query');

describe('query', () => {

  it('should have query types', () => {

    expect(query.types).to.equal({
      DELETE: 'DELETE',
      INSERT: 'INSERT',
      UPDATE: 'UPDATE'
    });

  });

  it('should have a function to run queries', () => {

    const queries = [];
    const data = {rows: []};

    expect(query.run(queries, data)).to.equal(data);

  });

  describe('when inserting rows', () => {

    const row = {column: 'column'};
    const insertQuery = {
      rows: [row],
      type: query.types.INSERT
    };
    let data,
      updatedData;

    beforeEach(() => {

      data = {
        index: {},
        lastInsertId: 0,
        rows: []
      };

      updatedData = query.run([insertQuery], data);

    });

    it('should return data with inserted rows', () => {

      const expectedRows = [
        Object.assign({$idbID: 1}, row)
      ];

      expect(updatedData.rows).to.equal(expectedRows);

    });

    it('should build index for inserted rows', () => {

      const expectedIndex = {
        1: 0
      };

      expect(updatedData.index).to.equal(expectedIndex);

    });

    it('should update the last insert id', () => {

      const expectedId = 1;

      expect(updatedData.lastInsertId).to.equal(expectedId);

    });

    describe('and more rows', () => {

      const insertMoreQuery = {
        lastInsertId: 1,
        rows: [row, row],
        type: query.types.INSERT
      };

      beforeEach(() => updatedData = query.run([insertMoreQuery], updatedData));

      it('should return data with inserted rows', () => {

        const expectedRows = [
          Object.assign({$idbID: 1}, row),
          Object.assign({$idbID: 2}, row),
          Object.assign({$idbID: 3}, row)
        ];

        expect(updatedData.rows).to.equal(expectedRows);

      });

      it('should build index for inserted rows', () => {

        const expectedIndex = {
          1: 0,
          2: 1,
          3: 2
        };

        expect(updatedData.index).to.equal(expectedIndex);

      });

      it('should update the last insert id', () => {

        const expectedId = 3;

        expect(updatedData.lastInsertId).to.equal(expectedId);

      });

    });

  });

  describe('when updating rows', () => {

    let tableData,
      updatedData;

    const updateFunction = row => Object.assign({}, row, {
      column: row.column * 2
    });
    const filterFunction = data => data.rows.filter(row => row.$idbID > 1);
    const updateQuery = {
      filter: filterFunction,
      type: query.types.UPDATE,
      update: updateFunction
    };

    before(() => {

      tableData = {
        index: {
          1: 0,
          2: 1,
          3: 2
        },
        lastInsertId: 3,
        rows: [
          {
            $idbID: 1,
            column: 3
          },
          {
            $idbID: 2,
            column: 4
          },
          {
            $idbID: 3,
            column: 5
          }
        ]
      };

      updatedData = query.run([updateQuery], tableData);

    });

    it('should return the updated rows', () => {

      const expectedRows = [
        {
          $idbID: 1,
          column: 3
        },
        {
          $idbID: 2,
          column: 8
        },
        {
          $idbID: 3,
          column: 10
        }
      ];

      expect(updatedData.rows).to.equal(expectedRows);

    });

    it('should not update the last insert id', () => {

      const expectedId = 3;

      expect(updatedData.lastInsertId).to.equal(expectedId);

    });

    it('should not update the index', () => {

      const expectedIndex = {
        1: 0,
        2: 1,
        3: 2
      };

      expect(updatedData.index).to.equal(expectedIndex);

    });

  });

});
