import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'

const alchemyApiKey = 'og4nnWIt39kz8KxzEN46npdmvtFiWkdr'
const mnemonic =
	'oblige unknown coil option innocent harsh basket cherry scrap monitor transfer alert idea crush regret glue knife bracket walnut blush wrist disease owner coconut'
const etherscanApiKey = 'P8FA8JIS622P87QTHRFRACZYQ378EG9IM6'

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
			url: `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
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
