const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const Transactions = await hre.ethers.getContractFactory("Transactions");

    // Deploy the contract
    const transactions = await Transactions.deploy();

    // Wait for the deployment to complete
    await transactions.deploymentTransaction();

    // Log the contract address
    console.log("Transactions contract deployed to:", transactions.target);
}

// Execute the main function
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});