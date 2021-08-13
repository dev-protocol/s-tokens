/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect, use } from 'chai'
import { Contract, constants } from 'ethers'

import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import * as STokensManagerStorageTest from '../build/STokensManagerStorageTest.json'
import * as TestData from '../build/TestData.json'

use(solidity)

describe('STokensManagerStorage', () => {
	const provider = new MockProvider()
	const [wallet] = provider.getWallets()
	let sTokensManagerStorage: Contract
	let testData: Contract

	beforeEach(async () => {
		sTokensManagerStorage = await deployContract(wallet, STokensManagerStorageTest)
		await sTokensManagerStorage.createStorage()
		testData = await deployContract(wallet, TestData)
	})

	describe('get data', () => {
		it('get default value', async () => {
			const tmp = await sTokensManagerStorage.getStoragePositionsV1(12345)
			expect(tmp.owner).to.equal(constants.AddressZero)
			expect(tmp.property).to.equal(constants.AddressZero)
			expect(tmp.amount.toString()).to.equal('0')
			expect(tmp.price.toString()).to.equal('0')
			expect(tmp.historical.toString()).to.equal('0')
		})
		it('get struct value', async () => {
			const address1 = provider.createEmptyWallet().address
			const address2 = provider.createEmptyWallet().address
			const data = await testData.getStakingPosition(address1, address2, 10, 20, 30)
			await sTokensManagerStorage.setStoragePositionsV1Test(9, data, {
				gasLimit: 1200000
			})
			const tmp = await sTokensManagerStorage.getStoragePositionsV1(9)
			expect(tmp.owner).to.equal(address1)
			expect(tmp.property).to.equal(address2)
			expect(tmp.amount.toString()).to.equal('10')
			expect(tmp.price.toString()).to.equal('20')
			expect(tmp.historical.toString()).to.equal('30')
		})
	})
})
