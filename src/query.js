const getNextId = lastInsertId => lastInsertId + 1;

const insertRows = (data, query) => {

  let {lastInsertId} = data;

  const rows = data.rows.concat(
    query.rows.map(row => {

      lastInsertId = getNextId(lastInsertId);

      return Object.assign({$idbID: lastInsertId}, row);

    })
  );
  const index = rows.reduce(
    (indices, row, iterator) =>
      Object.assign(indices, {[row.$idbID]: iterator}),
    {}
  );

  return {
    index,
    lastInsertId,
    rows
  };

};

const updateRowsByFilter = (data, query) => {

  const rows = data.rows
    .map(row =>
      query.shouldUpdate(row) ?
        Object.assign(row, query.update(row)) :
        row
    );

  return Object.assign({}, data, {rows});

};

const updateRowsByIds = (data, query) => {

  const rows = data.rows.slice();

  query.ids.forEach($idbID => {

    const index = data.index[$idbID];
    const row = rows[index];

    rows[index] = Object.assign(row, query.update(row));

  });

  return Object.assign({}, data, {rows});

};

const types = {
  DELETE: Symbol.for('DELETE'),
  INSERT: Symbol.for('INSERT'),
  UPDATE_BY_FILTER: Symbol.for('UPDATE_BY_FILTER'),
  UPDATE_BY_IDS: Symbol.for('UPDATE_BY_IDS')
};

const queryHandlers = {
  [types.INSERT]: insertRows,
  [types.UPDATE_BY_FILTER]: updateRowsByFilter,
  [types.UPDATE_BY_IDS]: updateRowsByIds
};

const run = (queries, data) => queries.reduce(
  (intermediateData, query) => queryHandlers[query.type](intermediateData, query),
  data
);

module.exports = {
  run,
  types
};
