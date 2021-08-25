/* eslint-disable spaced-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ethers } from 'hardhat'

async function main() {
	//!please check!!!!!!!!!
	const configAddress = ''
	//!!!!!!!!!!!!!!!!!!!!!!
	const sTokensManagerFactory = await ethers.getContractFactory(
		'STokensManager'
	)
	const sTokensManager = await sTokensManagerFactory.deploy()
	await sTokensManager.deployed()
	console.log(1)
	await sTokensManager.initialize(configAddress)
	console.log(2)
	const sTokensManagerProxyFactory = await ethers.getContractFactory(
		'STokensManagerProxy'
	)
	console.log(3)
	const data = ethers.utils.arrayify('0x')
	console.log(4)
	const sTokensManagerProxy = await sTokensManagerProxyFactory.deploy(
		sTokensManager.address,
		data
	)
	await sTokensManagerProxy.deployed()
	console.log(5)
	console.log('sTokensManager deployed to:', sTokensManager.address)
	console.log(
		'sTokensManagerProxyFactory deployed to:',
		sTokensManagerProxy.address
	)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
