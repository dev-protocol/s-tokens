/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { MockProvider } from 'ethereum-waffle'

export const deploy = async (name: string): Promise<Contract> => {
	const factoryStrage = await ethers.getContractFactory(name)
	const contract = await factoryStrage.deploy()
	await contract.deployed()
	return contract
}

export const deployWithArg = async (
	name: string,
	arg: number | string
): Promise<Contract> => {
	const factory = await ethers.getContractFactory(name)
	const contract = await factory.deploy(arg)
	await contract.deployed()
	return contract
}

export const deployWith2Arg = async (
	name: string,
	arg1: number | string,
	arg2: number | string | Uint8Array
): Promise<Contract> => {
	const factory = await ethers.getContractFactory(name)
	const contract = await factory.deploy(arg1, arg2)
	await contract.deployed()
	return contract
}

export const createMintParams = async (testData: Contract): Promise<any> => {
	const provider = new MockProvider()
	const owner = provider.createEmptyWallet()
	const property = provider.createEmptyWallet()
	const params = await testData.getMintParams(
		owner.address,
		property.address,
		10,
		20
	)
	return params
}

export const createUpdateParams = async (
	testData: Contract,
	tokenId = 1
): Promise<any> => {
	const params = await testData.getUpdateParams(tokenId, 100, 200, 300, 400)
	return params
}
