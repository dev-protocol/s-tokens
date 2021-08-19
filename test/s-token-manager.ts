/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import {  } from '@nomiclabs/hardhat-ethers'
// Import { SignerWithAddress } from '@nomiclabs/hardhat-ethers'
import { Contract, constants } from 'ethers'
import { MockProvider, solidity } from 'ethereum-waffle'
import { deploy, deployWithArg } from './utils'
import { checkTokenUri } from './token-uri-test'


use(solidity)

describe('STokensManager', () => {
	const init = async (): Promise<[Contract, Contract, Contract, Contract]> => {
		const [, lockup, user] = await ethers.getSigners()
		const addressConfig = await deploy('AddressConfigTest')
		await addressConfig.setLockup(lockup.address)
		const sTokensDescriptor = await deploy('STokensDescriptor')
		const sTokensManager = await deployWithArg('STokensManager', addressConfig.address)
		await sTokensManager.setDescriptor(sTokensDescriptor.address)
		const sTokensManagerLockup = sTokensManager.connect(lockup)
		const sTokensManagerUser = sTokensManager.connect(user)
		return [sTokensManager, sTokensManagerLockup, sTokensManagerUser, sTokensDescriptor]
	}

	const createMintParams = async (): Promise<any> => {
		const testData = await deploy('TestData')
		const provider = new MockProvider()
		const owner = provider.createEmptyWallet()
		const property = provider.createEmptyWallet()
		const params = await testData.getMintParams(owner.address, property.address, 10, 20)
		return params
	}

	const createUpdateParams = async (tokenId: number, amount: number, price: number, historical: number): Promise<any> => {
		const testData = await deploy('TestData')
		const params = await testData.getUpdateParams(tokenId, amount, price, historical)
		return params
	}

	describe('name', () => {
		it('get token name', async () => {
			const [sTokensManager] = await init()
			const name = await sTokensManager.name()
			expect(name).to.equal('SDev')
		})
	})
	describe('symbol', () => {
		it('get token symbol', async () => {
			const [sTokensManager] = await init()
			const symbol = await sTokensManager.symbol()
			expect(symbol).to.equal('SDEV')
		})
	})
	describe('setDescriptor', () => {
		describe('success', () => {
			it('set discriptor address', async () => {
				const [sTokensManager, , , sTokensDescriptor] = await init()
				const descriotorAddress = await sTokensManager.descriptor()
				expect(descriotorAddress).to.equal(sTokensDescriptor.address)
			})
		})
		describe('fail', () => {
			it('get token symbol', async () => {
				const [, , sTokensManagerUser] = await init()
				const provider = new MockProvider()
				const tmp = provider.createEmptyWallet()
				await expect(sTokensManagerUser.setDescriptor(tmp.address)).to.be.revertedWith(
					'Ownable: caller is not the owner'
				)
			})
		})
	})
	describe('tokenURI', () => {
		describe('success', () => {
			it('get token uri', async () => {
				const [, sTokensManagerLockup] = await init()
				const mintParam = await createMintParams()
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const filter = sTokensManagerLockup.filters.Transfer()
				const events = await sTokensManagerLockup.queryFilter(filter)
				const tokenId = events[0].args!.tokenId.toString()
				const uri = await sTokensManagerLockup.tokenURI(Number(tokenId))
				checkTokenUri(uri, mintParam.property, mintParam.amount, 0)
			})
		})
		describe('fail', () => {
			it('get token symbol', async () => {
				const [sTokensManager] = await init()
				await expect(sTokensManager.tokenURI(1)).to.be.revertedWith(
					'not found'
				)
			})
		})
	})
	describe('mint', () => {
		describe('success', () => {
			it('mint nft', async () => {
				const [, sTokensManagerLockup] = await init()
				const mintParam = await createMintParams()
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const tokenId = await sTokensManagerLockup.balanceOf(mintParam.owner)
				expect(tokenId.toString()).to.equal('1')
				const owner = await sTokensManagerLockup.ownerOf(1)
				expect(owner).to.equal(mintParam.owner)
			})
			it('generate event', async () => {
				const [, sTokensManagerLockup] = await init()
				const mintParam = await createMintParams()
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const filter = sTokensManagerLockup.filters.Transfer()
				const events = await sTokensManagerLockup.queryFilter(filter)
				const from = events[0].args!.from
				const to = events[0].args!.to
				const tokenId = events[0].args!.tokenId.toString()
				expect(from).to.equal(constants.AddressZero)
				expect(to).to.equal(mintParam.owner)
				expect(tokenId).to.equal('1')
			})
			it('The counter will be incremented.', async () => {
				const [, sTokensManagerLockup] = await init()
				const mintParam = await createMintParams()
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const filter = sTokensManagerLockup.filters.Transfer()
				const events = await sTokensManagerLockup.queryFilter(filter)
				const tokenId = events[0].args!.tokenId.toString()
				expect(tokenId).to.equal('1')
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const eventsSecound = await sTokensManagerLockup.queryFilter(filter)
				const tokenIdSecound = eventsSecound[1].args!.tokenId.toString()
				expect(tokenIdSecound).to.equal('2')
			})
		})
		describe('fail', () => {
			it('If the owner runs it, an error will occur.', async () => {
				const [sTokensManager] = await init()
				const mintParam = await createMintParams()
				await expect(sTokensManager.mint(mintParam)).to.be.revertedWith(
					'illegal access'
				)
			})
			it('If the user runs it, an error will occur.', async () => {
				const [, , sTokenManagerUser] = await init()
				const mintParam = await createMintParams()
				await expect(sTokenManagerUser.mint(mintParam)).to.be.revertedWith(
					'illegal access'
				)
			})
		})
	})
	describe('update', () => {
		describe('success', () => {
			it('mint nft', async () => {
				const [, sTokensManagerLockup] = await init()
				const mintParam = await createMintParams()
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const tokenId = await sTokensManagerLockup.balanceOf(mintParam.owner)
				expect(tokenId.toString()).to.equal('1')
				const owner = await sTokensManagerLockup.ownerOf(1)
				expect(owner).to.equal(mintParam.owner)
			})
			it('generate event', async () => {
				const [, sTokensManagerLockup] = await init()
				const mintParam = await createMintParams()
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const filter = sTokensManagerLockup.filters.Transfer()
				const events = await sTokensManagerLockup.queryFilter(filter)
				const from = events[0].args!.from
				const to = events[0].args!.to
				const tokenId = events[0].args!.tokenId.toString()
				expect(from).to.equal(constants.AddressZero)
				expect(to).to.equal(mintParam.owner)
				expect(tokenId).to.equal('1')
			})
			it('The counter will be incremented.', async () => {
				const [, sTokensManagerLockup] = await init()
				const mintParam = await createMintParams()
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const filter = sTokensManagerLockup.filters.Transfer()
				const events = await sTokensManagerLockup.queryFilter(filter)
				const tokenId = events[0].args!.tokenId.toString()
				expect(tokenId).to.equal('1')
				await sTokensManagerLockup.mint(mintParam, {
					gasLimit: 1200000
				})
				const eventsSecound = await sTokensManagerLockup.queryFilter(filter)
				const tokenIdSecound = eventsSecound[1].args!.tokenId.toString()
				expect(tokenIdSecound).to.equal('2')
			})
		})
		describe('fail', () => {
			it('If the owner runs it, an error will occur.', async () => {
				const [sTokensManager] = await init()
				const mintParam = await createMintParams()
				await expect(sTokensManager.mint(mintParam)).to.be.revertedWith(
					'illegal access'
				)
			})
			it('If the user runs it, an error will occur.', async () => {
				const [, , sTokenManagerUser] = await init()
				const mintParam = await createMintParams()
				await expect(sTokenManagerUser.mint(mintParam)).to.be.revertedWith(
					'illegal access'
				)
			})
		})
	})
})



// // TODO _upgradeToAndCall、_upgradeToAndCallSecureは必要ない
// // 　　新しいコントラクトの関数実行したければ、upgradeToしてから独自にやってねという想定

// //

// // adminをlockupにするか。
// // proxy経由でsetApprovalForAll読んだ時、_msgSender()は何が取得できるのか
// // デリゲートコールしてて、ストレージはproxyのものだから、proxyじゃなくて通常のウォレットのアドレスが入りそうな気がするが
// // (むしろそうじゃないと詰む)
