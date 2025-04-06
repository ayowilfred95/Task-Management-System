const fs = require("fs");
const path = require("path");
const { upperCamelCase } = require("../../lib/helpers/app");

let daos = {}
fs.readdirSync(__dirname)
.filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file.slice(-3) === ".js" &&
    file !== 'index.js' &&
    file !== 'base-dao.js'
  );
})
.forEach((file) => {
  let [daoName] = file.split('.');
  daoName = upperCamelCase(daoName)+'DAO';
  daoName = daoName.replace(/-/g,"");
  const dao = require(path.join(__dirname, file));
  daos[daoName] = dao;
});

module.exports = daos;
