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

const updateRows = (data, query) => {

  data.rows
    .filter(query.filter)
    .map(row =>
      Object.assign(row, query.update(row))
    );

  return data;

};

const types = {
  DELETE: 'DELETE',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE'
};

const queryHandlers = {
  [types.INSERT]: insertRows,
  [types.UPDATE]: updateRows
};

const run = (queries, data) => queries.reduce(
  (intermediateData, query) => queryHandlers[query.type](data, query),
  data
);

module.exports = {
  run,
  types
};
