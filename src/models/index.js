const fs = require("fs");
const path = require("path");
const { upperCamelCase } = require("../../lib/helpers/app");

let sequelize;
let models = {}
const Sequelize = require("sequelize");
const cls = require('cls-hooked');


const db = require("../../config/sequelize");
const dbMode = process.env.NODE_ENV || 'development';
const dbConfig = db[dbMode];
sequelize = new Sequelize(dbConfig);


let scanPath = __dirname;
fs.readdirSync(scanPath)
.filter((file) => {
    return (
        file.indexOf(".") !== 0 &&
        file.slice(-3) === ".js" &&
        file !== 'index.js'
    );
})
.forEach((file) => {
    let [modelName] = file.split('.');
    modelName = upperCamelCase(modelName);
    modelName = modelName.replace(/-/g,"");
    const model = require(path.join(scanPath, file))(
        sequelize,
        Sequelize.DataTypes
    );
    models[modelName] = model;
});

Object.keys(models).forEach((k) => {
    // console.log("Registered Model:", k);
    if (models[k].associate) {
        models[k].associate(models);
    }
});

models.cls = cls;
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
