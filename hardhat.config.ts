import '@nomiclabs/hardhat-waffle'
import secret from './secrets.json'

module.exports = {
	mocha: {
		timeout: 300000,
	},
	solidity: '0.8.4',
	networks: {
		ropsten: {
			url: `https://eth-rinkeby.alchemyapi.io/v2/${secret.alchemyApiKey}`,
			accounts: { mnemonic: secret.mnemonic },
		},
		mainnet: {
			url: `https://eth.alchemyapi.io/v2/${secret.alchemyApiKey}`,
			accounts: { mnemonic: secret.mnemonic },
		},
	},
	settings: {
		optimizer: {
			enabled: true,
			runs: 1000,
		},
	},
}
