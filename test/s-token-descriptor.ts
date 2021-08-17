import { Contract } from 'ethers'
import { deployContract, MockProvider } from 'ethereum-waffle'
import * as STokensDescriptor from '../build/STokensDescriptor.json'
import * as TestData from '../build/TestData.json'
import {checkTokenUri} from './token-uri-test'

describe('STokensDescriptor', () => {
	const provider = new MockProvider()
	const [wallet] = provider.getWallets()
	let sTokensDescriptor: Contract
	let testData: Contract

	beforeEach(async () => {
		sTokensDescriptor = await deployContract(wallet, STokensDescriptor)
		testData = await deployContract(wallet, TestData)
	})

	describe('get descriptor data', () => {
		it('get token uri', async () => {
			const address1 = provider.createEmptyWallet().address
			const property = provider.createEmptyWallet().address
			const amount = 10
			const historical = 30
			const data = await testData.getStakingPosition(address1, property, amount, 20, historical)
			const t = await sTokensDescriptor.getTokenURI(data)
			checkTokenUri(t, property, amount, historical)
		})
	})
})
