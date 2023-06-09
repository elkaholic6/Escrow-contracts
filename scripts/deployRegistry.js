const hre = require("hardhat");

async function main() {
    const Registry = await hre.ethers.getContractFactory("Registry");
    const registry = await Registry.deploy();

    await registry.deployed();
    console.log("Registry:", registry);

    console.log(
        `Registry deployed to ${registry.address}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})