const assert = require('assert');

const errors = {
  databaseNameShouldBeString: idbName => `Expected database name to be a string, got ${typeof idbName}.`,
  invalidFilename: filename => `Expected ${filename} to match [a-zA-Z0-9]+([-_][a-zA-Z0-9]+)* pattern.`,
  rowShouldBeAnObject: (index, type) => `Expected row to be an object, got ${type} at ${index}.`,
  rowsRequired: length => `Expected one or more rows to insert, got ${length}.`,
  tableNameShouldBeString: idbName => `Expected table name to be a string, got ${typeof idbName}.`,
  updateShouldBeAFunction: update => `Expected "update" to be a function, got ${typeof update}.`,
  updateShouldNotMutate: () => 'Expected "update" to not mutate rows, got a function that will.',
  updateShouldReturnAnObject: type => `Expected "update" to return an object, got a function that will return ${type}.`
};

const assertToBeAnObject = (subject, callback) => {

  assert.notStrictEqual(subject, null, callback('null'));
  assert(!Array.isArray(subject), callback('array'));
  assert.strictEqual(typeof subject, 'object', callback(typeof subject));

};

const test = {

  toBeAnObject: (row, index) => assertToBeAnObject(
    row,
    type => errors.rowShouldBeAnObject(index, type)
  ),

  toHaveValidFilename: filename => /^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$/.test(filename),

  toNotMutateRows: update => {

    const column = Symbol('test column, should not be modified');
    const row = {column};

    update(row);

    assert(
      [
        Object.keys(row).length === 1,
        row.column === column
      ].every(condition => condition),
      errors.updateShouldNotMutate()
    );

  },

  toReturnAnObject: update => assertToBeAnObject(
    update({column: Symbol('test column')}),
    errors.updateShouldReturnAnObject
  )

};

module.exports = {
  errors,
  test
};
