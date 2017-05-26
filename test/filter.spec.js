const {expect} = require('code');
const filter = require('../src/filter');

describe('filter', () => {

  describe('when converting a filter to a function', () => {

    const tableData = {
      index: {
        10: 0,
        20: 2,
        30: 1
      },
      rows: [
        {
          $idbID: 10,
          column: 'column awesome'
        },
        {
          $idbID: 30,
          column: 'column match'
        },
        {
          $idbID: 20,
          column: 'column random'
        }
      ]
    };

    it('should return a function', () => {

      expect(filter.toFunction()).to.be.a.function();

    });

    describe('given the filter function', () => {

      it('should return all the rows when there is no filter', async () => {

        const result = filter.toFunction()(tableData);

        expect(result).to.equal(tableData.rows);

      });

      it('should return the rows satisfied by a filter function', async () => {

        const filterFunction = row => row.column === 'column match';
        const result = filter.toFunction(filterFunction)(tableData);
        const expectedRows = [
          tableData.rows[1]
        ];

        expect(result).to.equal(expectedRows);

      });

      it('should return the row with matching id', async () => {

        const id = 10;
        const result = filter.toFunction(id)(tableData);
        const expectedRows = [
          tableData.rows[0]
        ];

        expect(result).to.equal(expectedRows);

      });

      it('should return the rows with matching ids', async () => {

        const id1 = 10;
        const id2 = 20;
        const result = filter.toFunction([id1, id2])(tableData);
        const expectedRows = [
          tableData.rows[0],
          tableData.rows[2]
        ];

        expect(result).to.equal(expectedRows);

      });

    });

  });

});
