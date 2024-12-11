//https://eth-sepolia.g.alchemy.com/v2/xs5cTWBOftL2OO9_VoLf4h_hC9Fh-we4
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18", // Use a specific compiler version for better compatibility
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/xs5cTWBOftL2OO9_VoLf4h_hC9Fh-we4',
      accounts: ['0xd4fd55a27047d249a9ad994ae28b3b1ac7a0194d08df4489e683d250dce9f64d'] // Use "0x" prefix
    }
  }
};