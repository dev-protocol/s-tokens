/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ethers } from 'hardhat'

async function main() {
	const configAddress = '0x1D415aa39D647834786EB9B5a333A50e9935b796'

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
