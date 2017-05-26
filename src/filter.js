const mapFunctions = (criteria, functionHandler, otherHandler) => {

  let handler = otherHandler;

  if (typeof criteria === 'function') {

    handler = functionHandler;

  }

  return handler;

};

const toFunction = (filter = () => true) => mapFunctions(
  filter,
  data =>
    data.rows.filter(filter),
  data =>
    [].concat(filter).map($idbID =>
      data.rows[data.index[$idbID]]
    )
);

module.exports = {
  mapFunctions,
  toFunction
};
