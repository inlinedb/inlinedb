const {expect} = require('code');
const query = require('../src/query');

describe('query', () => {

  it('should have query types', () => {

    expect(query.types).to.equal({
      DELETE_BY_FILTER: Symbol.for('DELETE_BY_FILTER'),
      DELETE_BY_IDS: Symbol.for('DELETE_BY_IDS'),
      INSERT: Symbol.for('INSERT'),
      UPDATE_BY_FILTER: Symbol.for('UPDATE_BY_FILTER'),
      UPDATE_BY_IDS: Symbol.for('UPDATE_BY_IDS')
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

    const updateFunction = row => ({column: row.column * 2});

    describe('by ids', () => {

      const updateQuery = {
        ids: [1, 2],
        type: query.types.UPDATE_BY_IDS,
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
            column: 6
          },
          {
            $idbID: 2,
            column: 8
          },
          {
            $idbID: 3,
            column: 5
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

    describe('by filter', () => {

      const filterFunction = row => row.$idbID > 1;
      const updateQuery = {
        shouldUpdate: filterFunction,
        type: query.types.UPDATE_BY_FILTER,
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

  describe('when deleting rows', () => {

    let tableData,
      updatedData;

    describe('by ids', () => {

      const deleteQuery = {
        ids: [1, 2],
        type: query.types.DELETE_BY_IDS
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

        updatedData = query.run([deleteQuery], tableData);

      });

      it('should return the remaining rows', () => {

        const expectedRows = [
          {
            $idbID: 3,
            column: 5
          }
        ];

        expect(updatedData.rows).to.equal(expectedRows);

      });

      it('should not update the last insert id', () => {

        const expectedId = 3;

        expect(updatedData.lastInsertId).to.equal(expectedId);

      });

      it('should update the index', () => {

        const expectedIndex = {
          3: 0
        };

        expect(updatedData.index).to.equal(expectedIndex);

      });

      describe('when id is not there in table', () => {

        it('should not delete any', () => {

          const id = 5;

          deleteQuery.ids = [id];

          updatedData = query.run([deleteQuery], tableData);

          expect(updatedData).to.equal(tableData);

        });

      });

    });

    describe('by filter', () => {

      const filterFunction = row => row.$idbID < 2;
      const deleteQuery = {
        shouldDelete: filterFunction,
        type: query.types.DELETE_BY_FILTER
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

        updatedData = query.run([deleteQuery], tableData);

      });

      it('should return the updated rows', () => {

        const expectedRows = [
          {
            $idbID: 2,
            column: 4
          },
          {
            $idbID: 3,
            column: 5
          }
        ];

        expect(updatedData.rows).to.equal(expectedRows);

      });

      it('should not update the last insert id', () => {

        const expectedId = 3;

        expect(updatedData.lastInsertId).to.equal(expectedId);

      });

      it('should update the index', () => {

        const expectedIndex = {
          2: 0,
          3: 1
        };

        expect(updatedData.index).to.equal(expectedIndex);

      });

    });

  });

});
