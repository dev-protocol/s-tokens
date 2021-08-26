import '@nomiclabs/hardhat-waffle'

const alchemyApiKey = ''
const mnemonic = ''

module.exports = {
	mocha: {
		timeout: 300000,
	},
	solidity: '0.8.4',
	networks: {
		ropsten: {
			url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
			accounts: { mnemonic: mnemonic },
		},
		mainnet: {
			url: `https://eth.alchemyapi.io/v2/${alchemyApiKey}`,
			accounts: { mnemonic: mnemonic },
		},
	},
	settings: {
		optimizer: {
			enabled: true,
			runs: 1000,
		},
	},
}
