const ComponentFactory = artifacts.require("ComponentFactory");
const Manager = artifacts.require("Manager");

module.exports = function(deployer) {
  deployer.deploy(ComponentFactory).then(function() {
      return deployer.deploy(Manager, ComponentFactory.address);
  });
};
