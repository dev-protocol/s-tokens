import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import * as dotenv from 'dotenv'

dotenv.config()

const alchemyApiKeyMainnet = process.env.ALCHEMY_KEY_MAINNET
const alchemyApiKeyRopsten = process.env.ALCHEMY_KEY_ROPSTEN
const alchemyApiKeyRinkeby = process.env.ALCHEMY_KEY_RINKEBY
const mnemonic = process.env.MNEMONIC
const etherscanApiKey = process.env.ETHERSCAN_KEY

module.exports = {
	mocha: {
		timeout: 300000,
	},
	solidity: '0.8.4',
	networks: {
		ropsten: {
			url: `https://eth-ropsten.alchemyapi.io/v2/${alchemyApiKeyRopsten}`,
			accounts: { mnemonic },
		},
		rinkeby: {
			url: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKeyRinkeby}`,
			accounts: { mnemonic },
		},
		mainnet: {
			url: `https://eth.alchemyapi.io/v2/${alchemyApiKeyMainnet}`,
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
