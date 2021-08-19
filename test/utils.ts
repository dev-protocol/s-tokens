
import { ethers } from "hardhat";
import { Contract } from 'ethers'

export const deploy = async (
	name: string,
): Promise<Contract> => {
	const factoryStrage = await ethers.getContractFactory(name);
	const contract = await factoryStrage.deploy()
	await contract.deployed()
	return contract
}

export const deployWithArg = async (
	name: string,
	arg: number | string
): Promise<Contract> => {
	const factoryStrage = await ethers.getContractFactory(name);
	const contract = await factoryStrage.deploy(arg)
	await contract.deployed()
	return contract
}
