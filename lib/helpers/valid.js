const joi = require("joi");

exports.string = (label = null, options = {}) => {
  let { required = false } = options;
  let schema = joi.string().trim().max(255);
  if (label) schema = schema.label(label);
  if (required) schema = schema.required();
  return schema;
};

exports.shortString = (label = null, options = {}) => {
  let { required = false } = options;
  let schema = joi.string().trim().max(255);
  if (label) schema = schema.label(label);
  if (required) schema = schema.required();
  return schema;
};

exports.longString = (label = null, options = {}) => {
  let { required = false } = options;
  let schema = joi.string().trim().max(1024);
  if (label) schema = schema.label(label);
  if (required) schema = schema.required();
  return schema;
};

exports.email = (label = null, options = {}) => {
  let { required = false } = options;
  let schema = joi.string().email({ minDomainSegments: 2 });
  if (label) schema = schema.label(label);
  if (required) schema = schema.required();
  return schema;
};

exports.password = (label = "Password", options = {}) => {
  let { required = false } = options;
  let schema = joi
    .string()
    .min(6)
    .regex(/^(?=\S*[a-z])(?=\S*[A-Z])(?=\S*\d)(?=\S*[^\w\s])\S{6,30}$/)
    .messages({
      "string.min": `"${label}" should be 6 characters or more`,
      "object.regex": `"${label}" should have at least 1 digit, 1 uppper case and 1 special character`,
      "string.pattern.base": `"${label}" must have a minimum of 6 characters, at least one uppercase letter, one number and one special character`,
    });
  if (label) schema = schema.label(label);
  if (required) schema = schema.required();
  return schema;
};

// Numbers

exports.number = (label = null, options = {}) => {
  let { required = false } = options;
  let schema = joi.number().min(0);
  if (label) schema = schema.label(label);
  if (required) schema = schema.required();
  return schema;
};

exports.enum = (label = null, items = [], options = {}) => {
  let { required = false } = options;
  let schema = joi.valid(items.concat(","));
  if (label) schema = schema.label(label);
  if (required) schema = schema.required();
  return schema;
};

exports.date = (label = null, options = {}) => {
  let { required = false } = options;
  let schema = joi.date();
  if (label) schema = schema.label(label);
  if (required) schema = schema.required();
  return schema;
};

exports.query = (query, rules = {}, includeOperators = false) => {
  let errors;
  let values = {};
  let parsedQuery = { ...query };
  let parsedRules = { ...rules };
  let allOperators = ["eq", "not", "lt", "lte", "gt", "gte", "like", "notLike"];
  let dataOperatorTypes = {
    date: allOperators,
    number: allOperators,
    string: ["eq", "not", "like", "notLike"],
  };

  if (parsedQuery && typeof parsedQuery === "object") {
    Object.entries(parsedQuery).map(([key, val]) => {
      let item, operator;
      let regex = /(?:\.([^.]+))?$/;
      let op = regex.exec(key)[1];
      if (op && allOperators.includes(op)) {
        item = key.split(".").slice(0, -1).join(".");
        operator = op;
      } else {
        item = key;
      }

      if (parsedRules.hasOwnProperty(item)) {
        const schema = parsedRules[item];
        if (joi.isSchema(schema)) {
          const dataType = schema.type;
          if (
            includeOperators &&
            operator &&
            dataOperatorTypes.hasOwnProperty(dataType)
          ) {
            const operatorTypes = dataOperatorTypes[dataType];
            if (operatorTypes.includes(operator)) {
              parsedRules = { ...parsedRules, [key]: schema };
              if (operator == "like" || operator == "notLike") {
                parsedQuery[key] = `%${val}%`;
              }
            }
          }
        }
      }
    });

    const { error, value } = joi
      .object(parsedRules)
      .validate(parsedQuery, { abortEarly: false });
    if (error?.details && Array.isArray(error.details)) {
      error.details.map((detail) => {
        console.log(detail);
        let errorKey = detail.path[0] ?? detail.context.key;
        errors = { ...errors, [errorKey]: detail.message };
      });
    }

    if (value) {
      Object.entries(value).map(([key, val]) => {
        if (!(errors && errors.hasOwnProperty(key))) {
          values = { ...values, [key]: val };
        }
      });
    }
  }
  return {
    errors,
    values,
  };
};
