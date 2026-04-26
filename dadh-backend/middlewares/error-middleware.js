const errorMiddleware = (err, req, res, next) => {
    const status = err.status || 500; // 500 is a standard status for server errors
    const message =  err.message || 'Backend Error';
    const extraDetail = err.extraDetail || 'Error From The Backend';
  
    const error = {status, message, extraDetail};
    console.log('from error middleware ', error);
    return res.status(status).json(error);
  };
  
  module.exports = errorMiddleware;
  