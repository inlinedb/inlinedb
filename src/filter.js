const toFunction = (filter = () => true) => {

  let func;

  if (typeof filter === 'function') {

    func = data =>
      data.rows.filter(filter);

  } else {

    func = data =>
      [].concat(filter).map($idbID =>
        data.rows[data.index[$idbID]]
      );

  }

  return func;

};

module.exports = {
  toFunction
};
