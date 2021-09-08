/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { solidity } from 'ethereum-waffle'
import {
	deploy,
	deployWithArg,
	deployWith3Arg,
	createMintParams,
} from './utils'
import { checkTokenUri } from './token-uri-test'

use(solidity)

describe('STokenmanagerProxy', () => {
	const init = async (): Promise<
		[Contract, Contract, Contract, Contract, Contract, Contract]
	> => {
		const addressConfig = await deploy('AddressConfigTest')
		const sTokensManager = await deploy('STokensManager')
		const data = ethers.utils.arrayify('0x')
		const proxyAdmin = await deploy('ProxyAdmin')
		const proxy = await deployWith3Arg(
			'TransparentUpgradeableProxy',
			sTokensManager.address,
			proxyAdmin.address,
			data
		)
		const lockup = await deployWithArg('LockupTest', proxy.address)
		await addressConfig.setLockup(lockup.address)
		const sTokenManagerFactory = await ethers.getContractFactory(
			'STokensManager'
		)
		const proxyDelegate = sTokenManagerFactory.attach(proxy.address)
		await proxyDelegate.initialize(addressConfig.address)

		return [
			proxy,
			proxyDelegate,
			sTokensManager,
			lockup,
			addressConfig,
			proxyAdmin,
		]
	}

	describe('upgradeTo', () => {
		describe('success', () => {
			it('upgrade logic contract', async () => {
				const [proxy, proxyDelegate, , lockup, , proxyAdmin] = await init()
				const mintParams = createMintParams()
				await lockup.executeMint(
					mintParams.owner,
					mintParams.property,
					mintParams.amount,
					mintParams.price
				)
				const tokenId = await lockup.latestTokenId()
				const uriFirst = await proxyDelegate.tokenURI(tokenId)
				checkTokenUri(uriFirst, mintParams.property, mintParams.amount, 0)
				const sTokensManagerSecound = await deploy('STokensManagerTest')
				await proxyAdmin.upgrade(proxy.address, sTokensManagerSecound.address)
				const sTokenManagerTestFactory = await ethers.getContractFactory(
					'STokensManagerTest'
				)
				const proxyDelegateTest = sTokenManagerTestFactory.attach(proxy.address)
				const uriSecound = await proxyDelegateTest.dummyFunc()
				expect(uriSecound).to.equal(10)
			})

			it('The data is stored in the proxy(STokensManager)', async () => {
				const [proxy, proxyDelegate, , , addressConfig, proxyAdmin] =
					await init()
				const configAddress = await proxyDelegate.config()
				expect(configAddress).to.equal(addressConfig.address)
				const sTokensManagerSecound = await deploy('STokensManager')
				await proxyAdmin.upgrade(proxy.address, sTokensManagerSecound.address)
				const configAddressSecond = await proxyDelegate.config()
				expect(configAddressSecond).to.equal(addressConfig.address)
			})

			it('The data is stored in the proxy(ERC721Upgradeable)', async () => {
				const [proxy, proxyDelegate, , lockup, , proxyAdmin] = await init()
				const mintParams = createMintParams()
				await lockup.executeMint(
					mintParams.owner,
					mintParams.property,
					mintParams.amount,
					mintParams.price
				)
				const tokenId = await lockup.latestTokenId()
				const uriFirst = await proxyDelegate.tokenURI(tokenId)
				checkTokenUri(uriFirst, mintParams.property, mintParams.amount, 0)
				const sTokensManagerSecound = await deploy('STokensManager')
				await proxyAdmin.upgrade(proxy.address, sTokensManagerSecound.address)
				const uriSecound = await proxyDelegate.tokenURI(tokenId)
				checkTokenUri(uriSecound, mintParams.property, mintParams.amount, 0)
			})
		})
	})
})
