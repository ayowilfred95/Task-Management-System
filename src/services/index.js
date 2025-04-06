const fs = require("fs");
const path = require("path");
const { upperCamelCase } = require("../../lib/helpers/app");

let services = {}
fs.readdirSync(__dirname)
.filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file.slice(-3) === ".js" &&
    file !== 'index.js' 
  );
})
.forEach((file) => {
  let [serviceName] = file.split('.');
  serviceName = upperCamelCase(serviceName)+'Service';
  serviceName = serviceName.replace(/-/g,"");
  const service = require(path.join(__dirname, file));
  services[serviceName] = service;
});

module.exports = services;
