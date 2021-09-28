/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ethers } from 'hardhat'

async function main() {
	//!please check!!!!!!!!!
	const configAddress = '0xD6D07f1c048bDF2B3d5d9B6c25eD1FC5348D0A70'
	//!!!!!!!!!!!!!!!!!!!!!!

	// STokensManager
	const sTokensManagerFactory = await ethers.getContractFactory(
		'STokensManager'
	)
	const sTokensManager = await sTokensManagerFactory.deploy()
	await sTokensManager.deployed()

	// STokensManagerProxyAdmin
	const sTokensManagerProxyAdminFactory = await ethers.getContractFactory(
		'STokensManagerProxyAdmin'
	)
	const sTokensManagerProxyAdmin =
		await sTokensManagerProxyAdminFactory.deploy()
	await sTokensManagerProxyAdmin.deployed()

	const data = ethers.utils.arrayify('0x')

	// STokensManagerProxy
	const sTokensManagerProxyFactory = await ethers.getContractFactory(
		'STokensManagerProxy'
	)
	const sTokensManagerProxy = await sTokensManagerProxyFactory.deploy(
		sTokensManager.address,
		sTokensManagerProxyAdmin.address,
		data
	)
	await sTokensManagerProxy.deployed()

	const proxy = sTokensManagerFactory.attach(sTokensManagerProxy.address)
	await proxy.initialize(configAddress)


	console.log('sTokensManager deployed to:', sTokensManager.address)
	console.log('sTokensManagerProxy deployed to:', sTokensManagerProxy.address)
	console.log(
		'sTokensManagerProxyAdmin deployed to:',
		sTokensManagerProxyAdmin.address
	)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
