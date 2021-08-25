/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ethers } from 'hardhat'

async function main() {
	//!please check!!!!!!!!!
	const configAddress = '0xD6D07f1c048bDF2B3d5d9B6c25eD1FC5348D0A70'
	//!!!!!!!!!!!!!!!!!!!!!!
	const sTokensManagerFactory = await ethers.getContractFactory("STokensManager");
	const sTokensManager = await sTokensManagerFactory.deploy()
	await sTokensManager.initialize(configAddress)
	
	const sTokensManagerProxyFactory = await ethers.getContractFactory("STokensManager");
	const data = ethers.utils.arrayify('0x')
	const sTokensManagerProxy = await sTokensManagerProxyFactory.deploy(sTokensManager.address, data)

	console.log("sTokensManager deployed to:", sTokensManager.address);
	console.log("sTokensManagerProxyFactory deployed to:", sTokensManagerProxy.address);
  }

  main()
	.then(() => process.exit(0))
	.catch((error) => {
	  console.error(error);
	  process.exit(1);
	});
