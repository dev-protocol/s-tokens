import '@nomiclabs/hardhat-waffle'

const privateKey = ''

module.exports = {
	mocha: {
		timeout: 300000,
	},
	solidity: '0.8.4',
	networks: {
		ropsten: {
			url: `https://hogehoge`,
			accounts: [`0x${privateKey}`],
		},
		mainnet: {
			accounts: [`0x${privateKey}`],
			url: `https://hogehoge`,
		},
	},
	settings: {
		optimizer: {
			enabled: true,
			runs: 1000,
		},
	},
}
