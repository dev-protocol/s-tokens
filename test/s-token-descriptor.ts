import { Contract } from 'ethers'
import { MockProvider } from 'ethereum-waffle'
import { checkTokenUri } from './token-uri-test'
import { deploy } from './utils'

describe('STokensDescriptor', () => {
	const provider = new MockProvider()
	let sTokensDescriptor: Contract
	let testData: Contract

	beforeEach(async () => {
		sTokensDescriptor = await deploy('STokensDescriptor')
		testData = await deploy('TestData')
	})

	describe('get descriptor data', () => {
		it('get token uri', async () => {
			const address1 = provider.createEmptyWallet().address
			const property = provider.createEmptyWallet().address
			const amount = 10
			const historical = 30
			const data = await testData.getStakingPosition(
				address1,
				property,
				amount,
				20,
				historical
			)
			const t = await sTokensDescriptor.getTokenURI(data)
			checkTokenUri(t, property, amount, historical)
		})
	})
})
