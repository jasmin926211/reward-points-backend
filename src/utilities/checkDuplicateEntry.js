const { ConflictException } = require('utilities/exceptions');

const checkDuplicateEntry = (error, title) => {
  if (error.name === 'MongoError' && error.code === 11000) {
    return new ConflictException(`${title} already exist`);
  }
};
module.exports = checkDuplicateEntry;
