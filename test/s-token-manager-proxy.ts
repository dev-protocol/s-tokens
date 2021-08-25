/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import { Contract, constants } from 'ethers'
import { solidity } from 'ethereum-waffle'
import {
	deploy,
	deployWithArg,
	deployWith2Arg,
	createMintParams,
} from './utils'
import { checkTokenUri } from './token-uri-test'

use(solidity)

describe('STokensManagerProxy', () => {
	let testData: Contract
	before(async () => {
		testData = await deploy('TestData')
	})

	const init = async (): Promise<
		[Contract, Contract, Contract, Contract, Contract]
	> => {
		const addressConfig = await deploy('AddressConfigTest')
		const sTokensManager = await deploy('STokensManager')
		const data = ethers.utils.arrayify('0x')
		const proxy = await deployWith2Arg(
			'STokensManagerProxy',
			sTokensManager.address,
			data
		)
		const lockup = await deployWithArg('LockupTest', proxy.address)
		await addressConfig.setLockup(lockup.address)
		const sTokenManagerFactory = await ethers.getContractFactory(
			'STokensManager'
		)
		const proxyDelegate = sTokenManagerFactory.attach(proxy.address)
		await proxyDelegate.initialize(addressConfig.address)

		return [proxy, proxyDelegate, sTokensManager, lockup, addressConfig]
	}

	describe('upgradeTo', () => {
		describe('success', () => {
			it('change implementation address', async () => {
				const [proxy, , sTokensManager] = await init()
				const implementation = await proxy.implementation()
				expect(implementation).to.equal(sTokensManager.address)
				const sTokensManagerSecound = await deploy('STokensManager')
				await proxy.upgradeTo(sTokensManagerSecound.address)
				const implementationSecound = await proxy.implementation()
				expect(implementationSecound).to.equal(sTokensManagerSecound.address)
			})

			it('upgrade logic contract', async () => {
				const [proxy, proxyDelegate, , lockup, addressConfig] = await init()
				const mintParam = await createMintParams(testData)
				await lockup.executeMint(mintParam)
				const tokenId = await lockup.latestTokenId()
				const uriFirst = await proxyDelegate.tokenURI(tokenId)
				checkTokenUri(uriFirst, mintParam.property, mintParam.amount, 0)
				const sTokensManagerSecound = await deploy('STokensManagerTest')
				await proxy.upgradeTo(sTokensManagerSecound.address)
				const sTokenManagerTestFactory = await ethers.getContractFactory(
					'STokensManagerTest'
				)
				const proxyDelegateTest = sTokenManagerTestFactory.attach(proxy.address)
				const uriSecound = await proxyDelegateTest.dummyFunc()
				expect(uriSecound).to.equal(addressConfig.address)
			})

			it('The data is stored in the proxy(STokensManager)', async () => {
				const [proxy, proxyDelegate, , , addressConfig] = await init()
				const configAddress = await proxyDelegate.config()
				expect(configAddress).to.equal(addressConfig.address)
				const sTokensManagerSecound = await deploy('STokensManager')
				await proxy.upgradeTo(sTokensManagerSecound.address)
				const configAddressSecond = await proxyDelegate.config()
				expect(configAddressSecond).to.equal(addressConfig.address)
			})

			it('The data is stored in the proxy(ERC721Upgradeable)', async () => {
				const [proxy, proxyDelegate, , lockup] = await init()
				const mintParam = await createMintParams(testData)
				await lockup.executeMint(mintParam)
				const tokenId = await lockup.latestTokenId()
				const uriFirst = await proxyDelegate.tokenURI(tokenId)
				checkTokenUri(uriFirst, mintParam.property, mintParam.amount, 0)
				const sTokensManagerSecound = await deploy('STokensManager')
				await proxy.upgradeTo(sTokensManagerSecound.address)
				const uriSecound = await proxyDelegate.tokenURI(tokenId)
				checkTokenUri(uriSecound, mintParam.property, mintParam.amount, 0)
			})

			it('The data is stored in the proxy(OwnableUpgradeable)', async () => {
				const [proxy, proxyDelegate] = await init()
				const owner = await proxyDelegate.owner()
				const sTokensManagerSecound = await deploy('STokensManager')
				await proxy.upgradeTo(sTokensManagerSecound.address)
				const ownerSecond = await proxyDelegate.owner()
				expect(owner).to.equal(ownerSecond)
			})
		})

		describe('fail', () => {
			it('only owner', async () => {
				const [, user] = await ethers.getSigners()
				const [proxy] = await init()
				const proxyUser = proxy.connect(user)
				await expect(
					proxyUser.upgradeTo(constants.AddressZero)
				).to.be.revertedWith('Ownable: caller is not the owner')
			})
		})
	})
})
