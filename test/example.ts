import { expect, use } from 'chai'
import { BigNumber, Contract } from 'ethers'
import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import * as Example from '../build/Example.json'
import { toBigNumber } from './lib/number'

use(solidity)

describe('Example', () => {
	const [wallet] = new MockProvider().getWallets()
	let example: Contract

	beforeEach(async () => {
		example = await deployContract(wallet, Example)
	})

	describe('value', () => {
		it('0 by default', async () => {
			const value: BigNumber = await example.value()
			expect(value.toString()).to.equal('0')
		})
	})

	describe('add', () => {
		it('Add the passed value to `value`', async () => {
			await example.add(toBigNumber(10).pow(18))
			const value: BigNumber = await example.value()

			expect(value.toString()).to.equal(toBigNumber(10).pow(18).toString())
		})
	})
})
