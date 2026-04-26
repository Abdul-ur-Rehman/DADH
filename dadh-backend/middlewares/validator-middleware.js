const validator = (schema) => async (req, res, next) => {
    try {
      const parseBody = await schema.parseAsync(req.body);
      req.body = parseBody;
      next();
    } catch (error) {
      const message = "Fill the fields properly";
      const status = 422;
      const extraDetail = error.errors[0].message;
      console.error(error)
      const errors = {
          status,
          message,
          extraDetail
      };
      next(errors);
    }
  };
  
  module.exports = validator;