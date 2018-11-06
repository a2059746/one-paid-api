import Joi from 'joi';

export default {

  createTest: {
    body: {
      test_name: Joi.string().alphanum().min(3).max(5).required(),
      test_age: Joi.number().integer().required(),
      test_sex: Joi.boolean()
    }
  }

}