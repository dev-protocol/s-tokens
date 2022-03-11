/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ethers } from 'hardhat'

async function main() {
	const adminAddress = ''
	const proxyAddress = ''

	console.log('addmin address:', adminAddress)
	console.log('proxy address:', proxyAddress)

	// STokensManager
	const sTokensManagerFactory = await ethers.getContractFactory(
		'STokensManager'
	)
	const sTokensManager = await sTokensManagerFactory.deploy()
	await sTokensManager.deployed()
	console.log('sTokensManager deployed to:', sTokensManager.address)

	// STokensManagerProxyAdmin
	const sTokensManagerProxyAdminFactory = await ethers.getContractFactory(
		'STokensManagerProxyAdmin'
	)
	const admin = sTokensManagerProxyAdminFactory.attach(adminAddress)

	await admin.upgrade(proxyAddress, sTokensManager.address)
	console.log('upgrade to:', await admin.getProxyImplementation(proxyAddress))
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
