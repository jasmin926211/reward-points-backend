const {
  ResourceNotFoundException,
} = require('utilities/exceptions');

const checkResourceAvailability = (id, data, message ) => {
  return new Promise(async (resolve, reject) => {
    if (!data) {
      return reject(new ResourceNotFoundException(`${message} no longer exist ` + id));
    }
    return resolve();
  }
)};

module.exports = { checkResourceAvailability };
