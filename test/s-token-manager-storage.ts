/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect } from 'chai'
import { Contract, constants } from 'ethers'
import { MockProvider } from 'ethereum-waffle'
import { deploy } from './utils'

describe('STokensManagerStorage', () => {
	const provider = new MockProvider()
	let sTokensManagerStorageTest: Contract
	let testData: Contract

	beforeEach(async () => {
		sTokensManagerStorageTest = await deploy('STokensManagerStorageTest')
		testData = await deploy('TestData')
	})

	describe('get data', () => {
		it('get default value', async () => {
			const tmp = await sTokensManagerStorageTest.getStoragePositionsV1(12345)
			expect(tmp.owner).to.equal(constants.AddressZero)
			expect(tmp.property).to.equal(constants.AddressZero)
			expect(tmp.amount.toString()).to.equal('0')
			expect(tmp.price.toString()).to.equal('0')
			expect(tmp.historical.toString()).to.equal('0')
		})
		it('get struct value', async () => {
			const address1 = provider.createEmptyWallet().address
			const address2 = provider.createEmptyWallet().address
			const data = await testData.getStakingPosition(
				address1,
				address2,
				10,
				20,
				30
			)
			await sTokensManagerStorageTest.setStoragePositionsV1Test(9, data, {
				gasLimit: 1200000,
			})
			const tmp = await sTokensManagerStorageTest.getStoragePositionsV1(9)
			expect(tmp.owner).to.equal(address1)
			expect(tmp.property).to.equal(address2)
			expect(tmp.amount.toString()).to.equal('10')
			expect(tmp.price.toString()).to.equal('20')
			expect(tmp.historical.toString()).to.equal('30')
		})
	})
})
