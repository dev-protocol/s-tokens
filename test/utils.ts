/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
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

export const deployWith3Arg = async (
	name: string,
	arg1: number | string,
	arg2: number | string,
	arg3: number | string | Uint8Array
): Promise<Contract> => {
	const factory = await ethers.getContractFactory(name)
	const contract = await factory.deploy(arg1, arg2, arg3)
	await contract.deployed()
	return contract
}

export const createMintParams = async (): Promise<any> => {
	const provider = new MockProvider()
	const owner = provider.createEmptyWallet()
	const signers = await getSigners()
	const property = await deployWithArg('PropertyTest', signers.user.address)
	return {
		owner: owner.address,
		property: property.address,
		amount: 10,
		price: 20,
	}
}

export const createUpdateParams = (tokenId = 1): any => ({
	tokenId,
	amount: 100,
	price: 200,
	cumulativeReward: 300,
	pendingReward: 400,
})

type Signers = {
	deployer: SignerWithAddress
	user: SignerWithAddress
}

export const getSigners = async (): Promise<Signers> => {
	const [deployer, user] = await ethers.getSigners()
	return { deployer, user }
}
