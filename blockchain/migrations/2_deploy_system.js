const ComponentFactory = artifacts.require("ComponentFactory");
const Registry = artifacts.require("Registry");
const Manager = artifacts.require("Manager");

module.exports = deployer => {
  return Promise.all(
    [
      deployer.deploy(ComponentFactory),
      deployer.deploy(Registry)
    ]
  ).then(() => {
    console.log('worked');
    return deployer.deploy(Manager, ComponentFactory.address, Registry.address)
  });
};
