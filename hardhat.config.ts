import '@nomiclabs/hardhat-waffle'

module.exports = {
	mocha: {
		timeout: 300000,
	},
	solidity: '0.8.4',
	settings: {
		optimizer: {
			enabled: true,
			runs: 1000,
		},
	},
}
