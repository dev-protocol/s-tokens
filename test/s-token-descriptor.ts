/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect, use } from 'chai'
import { Contract, constants, ethers } from 'ethers'
import { Buffer } from 'buffer'

import { deployContract, MockProvider, solidity } from 'ethereum-waffle'
import * as STokensDescriptor from '../build/STokensDescriptor.json'
import * as TestData from '../build/TestData.json'

use(solidity)

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
			const uriInfo = t.split(',')
			expect(uriInfo.length).to.equal(2)
			expect(uriInfo[0]).to.equal('data:application/json;base64')
			const decodedData = Buffer.from(uriInfo[1], 'base64').toString();
			const details = JSON.parse(decodedData);
			const {name, description, image} = details
			expect(name).to.equal(`Dev Protocol sTokens - ${property} - ${amount} DEV - ${historical}`)
			const testDescription = 'This NFT represents a staking position in a Dev Protocol Property tokens. The owner of this NFT can modify or redeem the position.\n'
			+  `Property Address: ${property}\n\n`
			+ '⚠ DISCLAIMER: Due diligence is imperative when assessing this NFT. Make sure token addresses match the expected tokens, as token symbols may be imitated.'
			expect(description).to.equal(testDescription)
			const imageInfo = image.split(',')
			expect(imageInfo.length).to.equal(2)
			expect(imageInfo[0]).to.equal('data:image/svg+xml;base64')
			const testImage = `<svg xmlns="http://www.w3.org/2000/svg" width="290" height="500" viewBox="0 0 290 500" fill="none"><rect width="290" height="500" fill="url(#paint0_linear)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M192 203H168.5V226.5V250H145H121.5V226.5V203H98H74.5V226.5V250V273.5H51V297H74.5H98V273.5H121.5H145H168.5H192V250V226.5H215.5H239V203H215.5H192Z" fill="white"/><text fill="white" xml:space="preserve" style="white-space: pre" font-family="monospace" font-size="11" letter-spacing="0em"><tspan x="27.4072" y="333.418">${property}</tspan></text><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="290" y2="500" gradientUnits="userSpaceOnUse"><stop stop-color="#00D0FD"/><stop offset="0.151042" stop-color="#4889F5"/><stop offset="0.552083" stop-color="#D500E6"/><stop offset="1" stop-color="#FF3815"/></linearGradient></defs></svg>`
			expect(imageInfo[1]).to.equal(testImage)
		})
	})
})
