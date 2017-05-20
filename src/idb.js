const mkdirp = require('mkdirp');
const file = require('./file');

class IDB {

  constructor(dbName) {

    if (file.doesIDBExist(dbName)) {

    } else {

      mkdirp.sync(dbName);

    }

  }

}

module.exports = {
  IDB
};
