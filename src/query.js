const isNumeric = n => !isNaN(parseFloat(n)) && isFinite(n);

const buildIndex = rows => rows.reduce(
  (indices, row, iterator) =>
    Object.assign(indices, {[row.$idbID]: iterator}),
  {}
);

const deleteRowsByFilter = (data, query) => {

  const rows = data.rows
    .filter(row => !query.shouldDelete(row));

  const index = buildIndex(rows);

  return Object.assign({}, data, {
    index,
    rows
  });

};

const deleteRowsByIds = (data, query) => {

  const rows = data.rows.slice();
  const indices = query.ids
    .map($idbID => data.index[$idbID])
    .sort((a, b) => b - a)
    .filter($idbID => isNumeric($idbID));

  indices.forEach(index => rows.splice(index, 1));

  const index = buildIndex(rows);

  return Object.assign({}, data, {
    index,
    rows
  });

};

const getNextId = lastInsertId => lastInsertId + 1;

const insertRows = (data, query) => {

  let {lastInsertId} = data;

  const rows = data.rows.concat(
    query.rows.map(row => {

      lastInsertId = getNextId(lastInsertId);

      return Object.assign({$idbID: lastInsertId}, row);

    })
  );
  const index = buildIndex(rows);

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
  DELETE_BY_FILTER: Symbol.for('DELETE_BY_FILTER'),
  DELETE_BY_IDS: Symbol.for('DELETE_BY_IDS'),
  INSERT: Symbol.for('INSERT'),
  UPDATE_BY_FILTER: Symbol.for('UPDATE_BY_FILTER'),
  UPDATE_BY_IDS: Symbol.for('UPDATE_BY_IDS')
};

const queryHandlers = {
  [types.DELETE_BY_FILTER]: deleteRowsByFilter,
  [types.DELETE_BY_IDS]: deleteRowsByIds,
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
