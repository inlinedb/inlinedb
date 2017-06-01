const {Table} = require('../src/table');
const {expect} = require('code');
const file = require('../src/file');
const filter = require('../src/filter');
const query = require('../src/query');
const sinon = require('sinon');
const validation = require('../src/validation');

describe('Table', () => {

  const idbName = 'db-name';
  const tableName = 'table-name';
  let sandbox,
    table,
    tableData;

  beforeEach(() => {

    sandbox = sinon.sandbox.create();
    tableData = {rows: []};

    table = new Table(idbName, tableName);

    sandbox.stub(file);
    sandbox.stub(filter);
    sandbox.stub(query);
    sandbox.stub(validation.test);

    file.loadTable.returns(Promise.resolve(tableData));

  });

  afterEach(() => sandbox.restore());

  it('should be initialized and used as object', () => {

    expect(table).to.be.object();

  });

  describe('on saving', () => {

    let saveTable,
      updatedTableData;

    beforeEach(() => {

      updatedTableData = {rows: ['updated']};

      saveTable = Promise.resolve();

      file.saveTable.returns(saveTable);

      query.run.returns(updatedTableData);

    });

    it('should return a promise', () => {

      expect(table.save()).instanceOf(Promise).to.equal(saveTable);

    });

    it('should load table data', () => {

      table.save();

      sinon.assert.calledOnce(file.loadTable);
      sinon.assert.calledWithExactly(file.loadTable, idbName, tableName);

    });

    it('should not run the queries yet', () => {

      sinon.assert.notCalled(query.run);

    });

    it('should not save the tables yet', () => {

      sinon.assert.notCalled(file.saveTable);

    });

    describe('after loading the data', () => {

      beforeEach(async () => await table.save());

      it('should run queries', () => {

        const queries = [];

        sinon.assert.calledOnce(query.run);
        sinon.assert.calledWithExactly(query.run, queries, tableData);

      });

      it('should save the table', () => {

        sinon.assert.calledOnce(file.saveTable);
        sinon.assert.calledWithExactly(file.saveTable, idbName, tableName, updatedTableData);

      });

    });

    describe('after failing to load the data', () => {

      beforeEach(async () => {

        const error = 'table does not exist';

        file.loadTable.returns(Promise.reject(error));

        await table.save();

      });

      it('should run queries on empty data', () => {

        const queries = [];
        const emptyTableData = {
          index: {},
          lastInsertId: 0,
          rows: []
        };

        sinon.assert.calledOnce(query.run);
        sinon.assert.calledWithExactly(query.run, queries, emptyTableData);

      });

      it('should save the table', () => {

        sinon.assert.calledOnce(file.saveTable);
        sinon.assert.calledWithExactly(file.saveTable, idbName, tableName, updatedTableData);

      });

    });

    describe('after saving the table', () => {

      const row = {column: 'column'};
      const insertQuery = {
        rows: [row],
        type: query.types.INSERT
      };

      it('should clear the queries', async () => {

        const queries = [insertQuery];

        table.insert(row);

        await table.save();

        sinon.assert.calledOnce(query.run);
        sinon.assert.calledWithExactly(query.run, queries, tableData);

        query.run.reset();
        await table.save();

        sinon.assert.calledOnce(query.run);
        sinon.assert.calledWithExactly(query.run, [], tableData);

      });

    });

  });

  describe('on inserting rows', () => {

    const row = {column: 'column'};

    it('should insert one row', async () => {

      const insertQuery = {
        rows: [row],
        type: query.types.INSERT
      };

      table.insert(row);

      await table.save();

      sinon.assert.calledOnce(query.run);
      sinon.assert.calledWithExactly(query.run, [insertQuery], tableData);

    });

    it('should insert array of rows', async () => {

      const insertQuery = {
        rows: [row, row],
        type: query.types.INSERT
      };

      table.insert(row, row);

      await table.save();

      sinon.assert.calledOnce(query.run);
      sinon.assert.calledWithExactly(query.run, [insertQuery], tableData);

    });

    it('should return this', () => {

      expect(table.insert({})).to.equal(table);

    });

  });

  describe('on querying rows', () => {

    let filterFunction;

    beforeEach(() => {

      filterFunction = sandbox.spy(() => Symbol.for('rows'));

      file.loadTable.returns(Promise.resolve(tableData));
      filter.toFunction.returns(filterFunction);

    });

    it('should load the table', () => {

      table.query();

      sinon.assert.calledOnce(file.loadTable);
      sinon.assert.calledWithExactly(file.loadTable, idbName, tableName);

    });

    it('should convert the filter to a function', async () => {

      const criteria = 'filter';

      await table.query(criteria);

      sinon.assert.calledOnce(filter.toFunction);
      sinon.assert.calledWithExactly(filter.toFunction, criteria);

    });

    it('should filter the data using the filter function', async () => {

      await table.query();

      sinon.assert.calledOnce(filterFunction);
      sinon.assert.calledWithExactly(filterFunction, tableData);

    });

    it('should return the filtered data', async () => {

      const result = await table.query();
      const expectedResult = Symbol.for('rows');

      expect(result).to.equal(expectedResult);

    });

  });

  describe('on updating rows', () => {

    const filterFunction = Symbol.for('filterFunction');
    const updateFunction = () => ({column: 'filter'});

    beforeEach(() => filter.map.returnsArg(1));

    describe('when there is no criteria', () => {

      beforeEach(() => table.update(updateFunction));

      it('should map the default criteria to a query', () => {

        const criteria = sinon.match.func;

        sinon.assert.calledOnce(filter.map);
        sinon.assert.calledWithExactly(filter.map, criteria,
          {
            shouldUpdate: criteria,
            type: query.types.UPDATE_BY_FILTER,
            update: updateFunction
          },
          {
            ids: [].concat(criteria),
            type: query.types.UPDATE_BY_IDS,
            update: updateFunction
          }
        );

      });

      it('should return true by default for filtering', () => {

        const call = filter.map.getCall(0);

        expect(call.args[1].shouldUpdate()).to.be.true();

        expect(call.args[2].ids).to.have.length(1);
        expect(call.args[2].ids[0]()).to.be.true();

      });

    });

    describe('when there is a criteria', () => {

      beforeEach(() => table.update(updateFunction, filterFunction));

      it('should map the default criteria to a query', () => {

        sinon.assert.calledOnce(filter.map);
        sinon.assert.calledWithExactly(filter.map, filterFunction,
          {
            shouldUpdate: filterFunction,
            type: query.types.UPDATE_BY_FILTER,
            update: updateFunction
          },
          {
            ids: [filterFunction],
            type: query.types.UPDATE_BY_IDS,
            update: updateFunction
          }
        );

      });

    });

    describe('after mapping criteria', () => {

      beforeEach(() => table.update(updateFunction, filterFunction));

      it('should queue the resulting query', async () => {

        const updateQuery = {
          shouldUpdate: filterFunction,
          type: query.types.UPDATE_BY_FILTER,
          update: updateFunction
        };

        await table.save();

        sinon.assert.calledOnce(query.run);
        sinon.assert.calledWithExactly(query.run, [updateQuery], tableData);

      });

    });

    it('should return this', () => {

      expect(table.update(updateFunction)).to.equal(table);

    });

  });

  describe('on deleting rows', () => {

    const filterFunction = Symbol.for('filterFunction');

    beforeEach(() => filter.map.returnsArg(2));

    describe('when there is no criteria', () => {

      beforeEach(() => table.delete());

      it('should map the default criteria to a query', () => {

        const criteria = sinon.match.func;

        sinon.assert.calledOnce(filter.map);
        sinon.assert.calledWithExactly(filter.map, criteria,
          {
            shouldDelete: criteria,
            type: query.types.DELETE_BY_FILTER
          },
          {
            ids: [].concat(criteria),
            type: query.types.DELETE_BY_IDS
          }
        );

      });

      it('should return true by default for filtering', () => {

        const call = filter.map.getCall(0);

        expect(call.args[1].shouldDelete()).to.be.true();

        expect(call.args[2].ids).to.have.length(1);
        expect(call.args[2].ids[0]()).to.be.true();

      });

    });

    describe('when there is a criteria', () => {

      beforeEach(() => table.delete(filterFunction));

      it('should map the default criteria to a query', () => {

        sinon.assert.calledOnce(filter.map);
        sinon.assert.calledWithExactly(filter.map, filterFunction,
          {
            shouldDelete: filterFunction,
            type: query.types.DELETE_BY_FILTER
          },
          {
            ids: [filterFunction],
            type: query.types.DELETE_BY_IDS
          }
        );

      });

    });

    describe('after mapping criteria', () => {

      beforeEach(() => table.delete(filterFunction));

      it('should queue the resulting query', async () => {

        const deleteQuery = {
          ids: [filterFunction],
          type: query.types.DELETE_BY_IDS
        };

        await table.save();

        sinon.assert.calledOnce(query.run);
        sinon.assert.calledWithExactly(query.run, [deleteQuery], tableData);

      });

    });

    it('should return this', () => {

      expect(table.delete()).to.equal(table);

    });

  });

  describe('on reverting queries', () => {

    it('should not remove the queued queries', async () => {

      table.insert(
        {column: 'column insert 1'},
        {column: 'column insert 2'}
      );
      table.update(
        () => ({column: 'column update'}),
        row => /insert 1$/.test(row)
      );
      table.delete(row => /insert 2$/.test(row));

      table.revert();

      await table.save();

      sinon.assert.calledOnce(query.run);
      sinon.assert.calledWithExactly(query.run, [], tableData);

    });

    it('should return this', () => {

      expect(table.revert()).to.equal(table);

    });

  });

  describe('validations', () => {

    describe('on inserting rows', () => {

      it('should throw if there are no rows', () => {

        expect(() => table.insert()).to.throw('Expected one or more rows to insert, got 0.');

      });

      it('should test if each row is an object', () => {

        const rows = [{a: 1}, {a: 2}, {a: 3}, {a: 4}];

        table.insert(...rows);

        expect(validation.test.toBeAnObject.callCount).to.equal(rows.length);
        rows.forEach((...args) => sinon.assert.calledWithExactly(validation.test.toBeAnObject, ...args));

      });

    });

    describe('on updating rows', () => {

      const updateFunction = () => ({});

      it('should throw if the "update" is not a function', () => {

        expect(() => table.update()).to.throw('Expected "update" to be a function, got undefined.');

      });

      it('should test "update" to not mutate rows', () => {

        table.update(updateFunction);

        sinon.assert.calledOnce(validation.test.toNotMutateRows);
        sinon.assert.calledWithExactly(validation.test.toNotMutateRows, updateFunction);

      });

      it('should test "update" to return an object', () => {

        table.update(updateFunction);

        sinon.assert.calledOnce(validation.test.toReturnAnObject);
        sinon.assert.calledWithExactly(validation.test.toReturnAnObject, updateFunction);

      });

    });

  });

});
