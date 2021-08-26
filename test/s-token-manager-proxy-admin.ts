import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import { Contract, constants } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { deploy, deployWithArg, deployWith3Arg } from './utils'

use(solidity)

describe('STokenmanagerProxyAdmin', () => {
	const init = async (): Promise<[Contract, Contract, Contract]> => {
		const addressConfig = await deploy('AddressConfigTest')
		const sTokensManager = await deploy('STokensManager')
		const data = ethers.utils.arrayify('0x')
		const proxyAdmin = await deploy('STokensManagerProxyAdmin')
		const proxy = await deployWith3Arg(
			'STokensManagerProxy',
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

		return [proxy, sTokensManager, proxyAdmin]
	}

	describe('getProxyImplementation', () => {
		describe('success', () => {
			it('get implementation address', async () => {
				const [proxy, sTokensManager, proxyAdmin] = await init()
				const implementation = await proxyAdmin.getProxyImplementation(
					proxy.address
				)
				expect(implementation).to.equal(sTokensManager.address)
			})
			it('change implementation address', async () => {
				const [proxy, sTokensManager, proxyAdmin] = await init()
				const implementation = await proxyAdmin.getProxyImplementation(
					proxy.address
				)
				expect(implementation).to.equal(sTokensManager.address)
				const sTokensManagerSecound = await deploy('STokensManager')
				await proxyAdmin.upgrade(proxy.address, sTokensManagerSecound.address)
				const implementationSecound = await proxyAdmin.getProxyImplementation(
					proxy.address
				)
				expect(implementationSecound).to.equal(sTokensManagerSecound.address)
			})
		})
		describe('fail', () => {
			it('get implementation address', async () => {
				const [proxy, , proxyAdmin] = await init()
				const [, user] = await ethers.getSigners()
				const proxyAdminUser = proxyAdmin.connect(user)
				await expect(
					proxyAdminUser.upgrade(proxy.address, constants.AddressZero)
				).to.be.revertedWith('Ownable: caller is not the owner')
			})
		})
	})
	describe('getProxyAdmin', () => {
		describe('success', () => {
			it('get admin address', async () => {
				const [proxy, , proxyAdmin] = await init()
				const implementation = await proxyAdmin.getProxyAdmin(proxy.address)
				expect(implementation).to.equal(proxyAdmin.address)
			})
			it('change admin address', async () => {
				const [proxy, , proxyAdmin] = await init()
				const adminAddress = await proxyAdmin.getProxyAdmin(proxy.address)
				expect(adminAddress).to.equal(proxyAdmin.address)
				const proxyAdminSecond = await deploy('STokensManagerProxyAdmin')
				await proxyAdmin.changeProxyAdmin(
					proxy.address,
					proxyAdminSecond.address
				)
				const adminAddressSecond = await proxyAdminSecond.getProxyAdmin(
					proxy.address
				)
				expect(adminAddressSecond).to.equal(proxyAdminSecond.address)
			})
		})
		describe('fail', () => {
			it('get admin address', async () => {
				const [proxy, , proxyAdmin] = await init()
				const [, user] = await ethers.getSigners()
				const proxyAdminUser = proxyAdmin.connect(user)
				await expect(
					proxyAdminUser.changeProxyAdmin(proxy.address, constants.AddressZero)
				).to.be.revertedWith('Ownable: caller is not the owner')
			})
		})
	})
})
