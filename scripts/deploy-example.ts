/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { deploy } from './deploy'
import { abi, bytecode } from '../build/Example.json'

void deploy(async (wallet, ContractFactory, envs) => {
	const { CONFIG } = envs
	const factory = new ContractFactory(abi, bytecode, wallet)
	void factory.deploy(CONFIG)
})
