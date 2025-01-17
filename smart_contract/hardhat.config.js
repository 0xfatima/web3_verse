require( "@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const{API_KEY, PRIVATE_KEY} = process.env;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  defaultNetwork:"sepolia",
  networks:{
    sepolia:{
      url:API_KEY,
      accounts:[`0x${PRIVATE_KEY}`]
    }
  }
};
