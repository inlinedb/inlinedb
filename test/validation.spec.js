const {expect} = require('code');
const validation = require('../src/validation');

describe('validation', () => {

  describe('test', () => {

    describe('to be an object', () => {

      const index = 10;

      it('should throw if "update" returns null', () => {

        const expectedMessage = 'Expected row to be an object, got null at 10.';

        expect(() => validation.test.toBeAnObject(null, index)).to.throw(expectedMessage);

      });

      it('should throw if "update" returns an array', () => {

        const expectedMessage = 'Expected row to be an object, got array at 10.';

        expect(() => validation.test.toBeAnObject([], index)).to.throw(expectedMessage);

      });

      it('should throw if "update" returns something that is not an object', () => {

        const expectedMessage = 'Expected row to be an object, got number at 10.';

        expect(() => validation.test.toBeAnObject(1, index)).to.throw(expectedMessage);

      });

      it('should not throw if "update" returns an object', () => {

        expect(() => validation.test.toBeAnObject({}, index)).to.not.throw();

      });

    });

    describe('to have a valid file name', () => {

      const invalidNames = [
        'test ',
        'Test-',
        'test+',
        'test_',
        '_test',
        'te$st',
        'te#st',
        'tes%t',
        'te st',
        '^teAt',
        't*est',
        '(test)'
      ];
      const validNames = [
        'test-table',
        'test_table',
        'testTable',
        'TestTable',
        'test-table-1',
        'test_table_2',
        'testTable3',
        'TestTable4'
      ];

      invalidNames.forEach(filename => it(`should return false for ${filename}`, () => {

        expect(validation.test.toHaveValidFilename(filename)).to.be.false();

      }));

      validNames.forEach(filename => it(`should return true for ${filename}`, () => {

        expect(validation.test.toHaveValidFilename(filename)).to.be.true();

      }));

    });

    describe('to not mutate rows', () => {

      it('should return false if "update" mutates row', () => {

        const addColumn = row => row.newColumn = 'new column';
        const changeColumn = row => row.column = 'changed';
        const deleteColumn = row => delete row.column;
        const expectedMessage = 'Expected "update" to not mutate rows, got a function that will.';

        expect(() => validation.test.toNotMutateRows(addColumn)).to.throw(expectedMessage);
        expect(() => validation.test.toNotMutateRows(changeColumn)).to.throw(expectedMessage);
        expect(() => validation.test.toNotMutateRows(deleteColumn)).to.throw(expectedMessage);

      });

      it('should return true if "update" does not mutate row', () => {

        const addColumn = row => Object.assign({}, row, {newColumn: 'new column'});
        const changeColumn = row => Object.assign({}, row, {column: 'changed'});
        const deleteColumn = row => {

          const copy = Object.assign({}, row);

          delete copy.column;

          return copy;

        };

        expect(() => validation.test.toNotMutateRows(addColumn)).to.not.throw();
        expect(() => validation.test.toNotMutateRows(changeColumn)).to.not.throw();
        expect(() => validation.test.toNotMutateRows(deleteColumn)).to.not.throw();

      });

    });

    describe('to return an object', () => {

      it('should throw if "update" returns null', () => {

        const returnNull = () => null;
        const expectedMessage = 'Expected "update" to return an object, got a function that will return null.';

        expect(() => validation.test.toReturnAnObject(returnNull)).to.throw(expectedMessage);

      });

      it('should throw if "update" returns an array', () => {

        const returnArray = () => [];
        const expectedMessage = 'Expected "update" to return an object, got a function that will return array.';

        expect(() => validation.test.toReturnAnObject(returnArray)).to.throw(expectedMessage);

      });

      it('should throw if "update" returns something that is not an object', () => {

        const returnNumber = () => 1;
        const expectedMessage = 'Expected "update" to return an object, got a function that will return number.';

        expect(() => validation.test.toReturnAnObject(returnNumber)).to.throw(expectedMessage);

      });

      it('should not throw if "update" returns an object', () => {

        const returnObject = () => ({});

        expect(() => validation.test.toReturnAnObject(returnObject)).to.not.throw();

      });

    });

  });

  describe('errors', () => {

    it('should return "Expected database name to be a string"', () => {

      const idbName = 123;
      const expectedMessage = 'Expected database name to be a string, got number.';

      expect(validation.errors.databaseNameShouldBeString(idbName)).to.equal(expectedMessage);

    });

    it('should return "Expected database name to be a string"', () => {

      const idbName = 123;
      const expectedMessage = 'Expected table name to be a string, got number.';

      expect(validation.errors.tableNameShouldBeString(idbName)).to.equal(expectedMessage);

    });

    it('should return "Expected filename to match pattern."', () => {

      const filename = 'te#st';
      const expectedMessage = 'Expected te#st to match [a-zA-Z0-9]+([-_][a-zA-Z0-9]+)* pattern.';

      expect(validation.errors.invalidFilename(filename)).to.equal(expectedMessage);

    });

    it('should return "Expected row to be an object"', () => {

      const type = 'string';
      const index = 10;
      const expectedMessage = 'Expected row to be an object, got string at 10.';

      expect(validation.errors.rowShouldBeAnObject(index, type)).to.equal(expectedMessage);

    });

    it('should return "Expected one or more rows to insert"', () => {

      const length = 0;
      const expectedMessage = 'Expected one or more rows to insert, got 0.';

      expect(validation.errors.rowsRequired(length)).to.equal(expectedMessage);

    });

    it('should return "Expected "update" to be a function"', () => {

      const update = 123;
      const expectedMessage = 'Expected "update" to be a function, got number.';

      expect(validation.errors.updateShouldBeAFunction(update)).to.equal(expectedMessage);

    });

    it('should return "Expected "update" to not mutate rows"', () => {

      const expectedMessage = 'Expected "update" to not mutate rows, got a function that will.';

      expect(validation.errors.updateShouldNotMutate()).to.equal(expectedMessage);

    });

    it('should return "Expected "update" to return an object"', () => {

      const type = 'string';
      const expectedMessage = 'Expected "update" to return an object, got a function that will return string.';

      expect(validation.errors.updateShouldReturnAnObject(type)).to.equal(expectedMessage);

    });

  });

});
