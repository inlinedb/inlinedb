const map = (criteria, functionHandler, otherHandler) => {

  let handler = otherHandler;

  if (typeof criteria === 'function') {

    handler = functionHandler;

  }

  return handler;

};

const toFunction = (filter = () => true) => map(
  filter,
  data =>
    data.rows.filter(filter),
  data =>
    [].concat(filter).map($idbID =>
      data.rows[data.index[$idbID]]
    )
);

module.exports = {
  map,
  toFunction
};
