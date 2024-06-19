const { ethers } = require('hardhat');

async function main(){
    const Transactions = await ethers.getContractFactory("Transactions");
    const transactions= await Transactions.deploy();


    console.log("deployed to " +transactions);
}

main().catch((error)=>{
    console.error(error);
    process.exitCode=1;
});