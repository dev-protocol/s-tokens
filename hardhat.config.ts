import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'

const alchemyApiKey = 'og4nnWIt39kz8KxzEN46npdmvtFiWkdr'
const mnemonic = ''
const etherscanApiKey = '8VQZGVMNHTAJEM531Z7SUYZK13MCZIIEY7'

module.exports = {
	mocha: {
		timeout: 300000,
	},
	solidity: '0.8.4',
	networks: {
		ropsten: {
			url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
			accounts: { mnemonic },
		},
		mainnet: {
			url: `https://eth.alchemyapi.io/v2/${alchemyApiKey}`,
			accounts: { mnemonic },
		},
	},
	settings: {
		optimizer: {
			enabled: true,
			runs: 1000,
		},
	},
	etherscan: {
		apiKey: etherscanApiKey,
	},
}
