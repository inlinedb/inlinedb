const mkdirp = require('mkdirp');

class IDB {

  constructor(dbName) {

    mkdirp.sync(dbName);

  }

}

module.exports = {
  IDB
};
