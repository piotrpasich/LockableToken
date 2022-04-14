const LockableToken = artifacts.require("LockableToken");

module.exports = function (deployer) {
    deployer.deploy(LockableToken);
}
