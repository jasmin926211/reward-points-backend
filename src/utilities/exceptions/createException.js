const createException = (exception,title, error, code) => {
  error.statusCode = code;
  error.title = title;
  error.message = exception;
}
module.exports = createException;
