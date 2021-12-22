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

	// STokensDescriptor
	const sTokensDescriptorFactory = await ethers.getContractFactory(
		'STokensDescriptor'
	)
	const sTokensDescriptor = await sTokensDescriptorFactory.deploy()
	await sTokensDescriptor.deployed()
	console.log('sTokensDescriptor deployed to:', sTokensDescriptor.address)

	// STokensManagerProxyAdmin
	const sTokensManagerProxyAdminFactory = await ethers.getContractFactory(
		'STokensManagerProxyAdmin'
	)
	const admin = sTokensManagerProxyAdminFactory.attach(adminAddress)

	await admin.upgrade(proxyAddress, sTokensManager.address)
	console.log('upgrade to:', await admin.getProxyImplementation(proxyAddress))

	const proxy = sTokensManagerFactory.attach(proxyAddress)
	await proxy.setDescriptor(sTokensDescriptor.address)
	console.log('set descripter address:', await proxy.descriptorAddress())
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
