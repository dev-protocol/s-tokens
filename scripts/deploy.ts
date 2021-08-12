/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { ethers, providers, ContractFactory } from 'ethers'
import { config, DotenvParseOutput } from 'dotenv'
import { Class } from 'type-fest'
import Provider = providers.Provider

export type ContractDeployer = (
	_wallet: ethers.Wallet,
	_factory: Class<ContractFactory>,
	_envs: DotenvParseOutput
) => Promise<void>

const getDeployer = (
	deployMnemonic?: string,
	deployNodeUrl = 'http://127.0.0.1:8545'
): ethers.Wallet => {
	if (!deployMnemonic) {
		throw new Error(
			`Error: No DEPLOY_MNEMONIC env var set. Please add it to .<environment>.env file it and try again. See .env.example for more info.\n`
		)
	}

	// Connect provider
	const provider: Provider = new ethers.providers.JsonRpcProvider(deployNodeUrl)

	return ethers.Wallet.fromMnemonic(deployMnemonic).connect(provider)
}

export const deploy = async (deployer: ContractDeployer): Promise<void> => {
	const envs = config().parsed ?? {}
	const mnemonic = envs.DEPLOY_MNEMONIC
	const node = envs.DEPLOY_NODE_URL
	const wallet = getDeployer(mnemonic, node)

	console.log(`Deploying to network [${node ?? 'local'}]`)
	await deployer(wallet, ContractFactory, envs)
}
