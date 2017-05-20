const fs = require('fs');

const fileExists = location => {

  try {

    return fs.statSync(location).isFile();

  } catch (e) {

    return false;

  }

};

module.exports = {
  fileExists
};
