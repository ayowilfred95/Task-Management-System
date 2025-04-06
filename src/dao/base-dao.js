const { Op } = require("sequelize");
const { appError } = require("../../lib/helpers/app");
const { sequelize } = require("../models");

class BaseDAO {
  model;
  transaction;

  constructor(model) {
    this.model = model;
  }

  fetchOne = async (
    where = null,
    { scope, attributes, include, order } = {}
  ) => {
    try {
      let data = {
        nest: true,
      };
      if (where) data.where = this.createWhere(where);
      if (attributes) data.attributes = attributes;
      if (include) data.include = this.createInclude(include);
      if (order) data.order = this.createOrder(order);
      const item = scope
        ? await this.model.scope(scope).findOne(data)
        : await this.model.findOne(data);
      return item?.get();
    } catch (error) {
      throw appError(error);
    }
  };

  fetchAll = async (
    where = null,
    { scope, attributes, include, order, limit, page = 1 } = {}
  ) => {
    try {
      let data = {
        nest: true,
        distinct: true,
      };
      /* Where */
      /* Example
        where: [
          firstName':'Bill,
          lastName':['not','Gates'],
          companyName:['like',`%Micro%`];
          status:['in',['Millionaire','Billionaire']];
        ]
      */

      if (where) data.where = this.createWhere(where);
      /* Attributes */
      /* Example
       attributes:['id', 'firstname', 'lastname'] 
      */
      if (attributes) data.attributes = attributes;
      /* Includes */
      /* Example
        include: [
          'courses',
          ['books', { where:{ title:'Mobi Dick'}, attributes:['title','edition'], include: ['author'] } ]
        ];
      */
      if (include) data.include = this.createInclude(include);
      if (limit) {
        data.limit = Number(limit);
        if (page) data.offset = (Number(page) - 1) * Number(limit);
      }
      if (order) data.order = this.createOrder(order);
      const result = scope
        ? await this.model.scope(scope).findAndCountAll(data)
        : await this.model.findAndCountAll(data);
      let response = {
        data: result.rows,
      };
      if (limit && page) {
        response["pagination"] = {
          limit,
          page: page,
          pages: Math.ceil(result.count / limit),
          rows: result.count,
        };
      }
      return response;
    } catch (error) {
      throw appError(error);
    }
  };

  count = async (where = null) => {
    try {
      let data = {};
      if (where) data.where = this.createWhere(where);
      const count = await this.model.count(data);
      return count;
    } catch (error) {
      throw appError(error);
    }
  };

  countCol = async (col, where = null) => {
    try {
      let data = {
        col,
        distinct: true,
      };
      if (where) data.where = this.createWhere(where);
      const count = await this.model.count(data);
      return count;
    } catch (error) {
      throw appError(error);
    }
  };

  create = async (data) => {
    try {
      const newEntry = await this.model.create(data);
      return newEntry;
    } catch (error) {
      throw appError(error);
    }
  };

  update = async (data, where) => {
    try {
      const updatedEntry = await this.model.update(data, {
        where: this.createWhere(where),
        returning: true,
      });
      if (updatedEntry[1][0]) {
        return updatedEntry[1][0];
      } else {
        return await this.fetchOne(where);
      }
    } catch (error) {
      throw appError(error);
    }
  };

  delete = async (where) => {
    try {
      const deleted = await this.model.destroy({
        where: this.createWhere(where),
      });
      return deleted;
    } catch (error) {
      throw appError(error);
    }
  };

  exist = async (where) => {
    try {
      const item = await this.model.findOne({
        where: this.createWhere(where),
      });
      return item ? true : false;
    } catch (error) {
      throw appError(error);
    }
  };

  idsExist = async (ids, where) => {
    try {
      const count = await this.model.count({
        where: {
          ...this.createWhere(where),
          id: ids,
        },
      });
      return ids.length === count;
    } catch (error) {
      throw appError(error);
    }
  };

  createWhere = (query) => {
    /*
        Query examples
        where['firstName'] = 'Bill';
        where['firstName.not'] = 'Bill;
        where['firstName.like'] = `%Bill%`;
        where['firstName.in'] = ['Mike','James'];
        where['subscription.name'] = 'Gold Plan';
      */
    let where = {};
    let allOperators = [
      "eq",
      "not",
      "lt",
      "lte",
      "gt",
      "gte",
      "like",
      "notLike",
      "iLike",
    ];
    Object.entries(query).forEach(([key, value]) => {
      let item, operator;
      let regex = /(?:\.([^.]+))?$/;
      let op = regex.exec(key)[1];
      if (op && allOperators.includes(op)) {
        item = key.split(".").slice(0, -1).join(".");
        operator = op;
      } else {
        item = key;
        operator = "eq";
      }
      if (item.indexOf(".") !== -1) {
        item = `$${item}$`;
      }
      if (where[item]) {
        where[item] = { ...where[item], [Op[operator]]: value };
      } else {
        where[item] = { [Op[operator]]: value };
      }
    });
    console.log(where);
    return where;
  };

  createInclude = (query) => {
    /*
      Query examples
      // Simple include
      include = ['roles'];
      // Nested include
      include = [
        'invoices',
        ['payments', { where:{ method:'PAYSTACK'}, attributes:['amount','status'], include: ['paymentMethod'] } ]
      ];
    */
    let include = [];
    query.map((item) => {
      if (Array.isArray(item)) {
        const includeAssociation = item[0];
        const {
          where: includeWhere,
          attributes: includeAttributes,
          include: includeIncludes,
          required: includeRequired,
          limit: includeLimit,
          // separate: includeSeparate,
          order: includeOrder,
        } = item[1] ?? {};
        let includeData = { association: includeAssociation };
        if (includeWhere != undefined)
          includeData = {
            ...includeData,
            where: this.createWhere(includeWhere),
          };
        if (includeAttributes != undefined)
          includeData = { ...includeData, attributes: includeAttributes };
        if (includeIncludes != undefined)
          includeData = {
            ...includeData,
            include: this.createInclude(includeIncludes),
          };
        if (includeRequired != undefined)
          includeData = { ...includeData, required: includeRequired };
        include.push(includeData);
      } else {
        const includeAssociation = item;
        include.push({ association: includeAssociation });
      }
    });
    return include;
  };

  createOrder = (order) => {
    /*
      Query examples
      order['firstName'] = 'ASC';
      order['books'] = ['createdAt','ASC'];
      */
    let orderResult = [];
    Object.entries(order).forEach(([key, value]) => {
      let orderValue;
      if (Array.isArray(value)) {
        orderValue = [key, value[0], value[1]];
      } else {
        orderValue = [key, value];
      }
      orderResult.push(orderValue);
    });
    return orderResult;
  };
}

module.exports = BaseDAO;
