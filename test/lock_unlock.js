const LockableToken = artifacts.require("LockableToken");
const truffleAssert = require('truffle-assertions');

let correctUnlockCode = web3.utils.sha3('test'); //test is the password
let timestampLockedFrom = Math.round(Date.now() / 1000) + 3; //lock it in 3 seconds to test unlock
let unlockCodeHash = web3.utils.sha3(correctUnlockCode); //double hashed

contract("LockableToken", function (accounts) {
  const [ deployedAdrress, tokenHolderOneAddress, tokenHolderTwoAddress ] = accounts

  it("should assert true", async function () {
    await LockableToken.deployed();
    return assert.isTrue(true);
  });

  it("is possible to mint the tokens for the minter role", async () => {
    let token = await LockableToken.deployed();

    await token.mint(tokenHolderOneAddress, timestampLockedFrom, unlockCodeHash)
    await truffleAssert.fails(token.transferFrom(deployedAdrress, tokenHolderOneAddress, 0))

    await truffleAssert.passes(token.transferFrom(tokenHolderOneAddress, tokenHolderTwoAddress, 0, { from: tokenHolderOneAddress }))
  })

  it("is not possible to transfer locked tokens", async () => {
    let token = await LockableToken.deployed();
    await new Promise((res) => setTimeout(res, 4000));

    await truffleAssert.fails(
        token.transferFrom(tokenHolderTwoAddress, tokenHolderOneAddress, 0, { from: tokenHolderTwoAddress }),
        truffleAssert.ErrorType.REVERT,
        "AishtisiToken: Token locked"
    )
  })

  it("is not possible to unlock tokens for anybody else than the token holder", async () => {
    let token = await LockableToken.deployed();

    await truffleAssert.fails(
        token.unlockToken(correctUnlockCode, 0, {from: tokenHolderOneAddress}),
        truffleAssert.ErrorType.REVERT,
        "AishtisiToken: Only the Owner can unlock the Token"
    )
  })

  it("is possible to unlock tokens by an owner", async () => {
    let token = await LockableToken.deployed();

    await truffleAssert.passes(
        token.unlockToken(correctUnlockCode, 0, {from: tokenHolderTwoAddress}),
    )
  })

  it("is possible to transfer tokens from the owner after it is unlucked", async () => {
    let token = await LockableToken.deployed();
    await truffleAssert.passes(
        token.transferFrom(tokenHolderTwoAddress, tokenHolderOneAddress, 0, { from: tokenHolderTwoAddress })
    )
  })
  it('is possible to retrieve the correct token URI', async () => {
    let token = await LockableToken.deployed();
    let metadata = await token.tokenURI(0);
    assert.equal('https://Lockable.art/metadata/0.json', metadata);
  })

  it('is not possible to mint tokens by not owner', async () => {
    let token = await LockableToken.deployed();
    truffleAssert.fails(
        token.mint(tokenHolderOneAddress, timestampLockedFrom, unlockCodeHash, { from: tokenHolderTwoAddress })
    )
  })
});
