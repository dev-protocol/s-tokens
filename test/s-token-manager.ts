/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable new-cap */
import { expect, use } from 'chai'
import { ethers } from 'hardhat'
import { Contract, constants } from 'ethers'
import { solidity } from 'ethereum-waffle'
import {
	deploy,
	deployWithArg,
	createMintParams,
	createUpdateParams,
} from './utils'
import { HARDHAT_ERROR } from './const'
import { checkTokenUri } from './token-uri-test'

use(solidity)

describe('STokensManager', () => {
	const init = async (): Promise<[Contract, Contract, Contract]> => {
		const [, user] = await ethers.getSigners()
		const addressConfig = await deploy('AddressConfigTest')
		const sTokensManager = await deploy('STokensManager')
		await sTokensManager.initialize(addressConfig.address)
		const lockup = await deployWithArg('LockupTest', sTokensManager.address)
		await addressConfig.setLockup(lockup.address)
		const sTokensManagerUser = sTokensManager.connect(user)
		return [sTokensManager, sTokensManagerUser, lockup]
	}

	describe('initialize', () => {
		it('The initialize function can only be executed once.', async () => {
			const [sTokensManager] = await init()
			await expect(
				sTokensManager.initialize(constants.AddressZero)
			).to.be.revertedWith('Initializable: contract is already initialized')
		})
	})

	describe('name', () => {
		it('get token name', async () => {
			const [sTokensManager] = await init()
			const name = await sTokensManager.name()
			expect(name).to.equal('Dev Protocol sTokens V1')
		})
	})
	describe('symbol', () => {
		it('get token symbol', async () => {
			const [sTokensManager] = await init()
			const symbol = await sTokensManager.symbol()
			expect(symbol).to.equal('DEV-STOKENS-V1')
		})
	})
	describe('tokenURI', () => {
		describe('success', () => {
			it('get token uri', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const filter = sTokensManager.filters.Transfer()
				const events = await sTokensManager.queryFilter(filter)
				const tokenId = events[0].args!.tokenId.toString()
				const uri = await sTokensManager.tokenURI(Number(tokenId))
				checkTokenUri(uri, mintParam.property, mintParam.amount, 0)
			})
		})
		describe('fail', () => {
			it('can not get token symbol', async () => {
				const [sTokensManager] = await init()
				await expect(sTokensManager.tokenURI(1)).to.be.revertedWith(
					HARDHAT_ERROR
				)
			})
		})
	})
	describe('mint', () => {
		describe('success', () => {
			it('mint nft', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const tokenId = await sTokensManager.balanceOf(mintParam.owner)
				expect(tokenId.toString()).to.equal('1')
				const owner = await sTokensManager.ownerOf(1)
				expect(owner).to.equal(mintParam.owner)
			})
			it('generate minted event', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await expect(
					lockup.executeMint(
						mintParam.owner,
						mintParam.property,
						mintParam.amount,
						mintParam.price,
						{
							gasLimit: 1200000,
						}
					)
				)
					.to.emit(sTokensManager, 'Minted')
					.withArgs(
						1,
						mintParam.owner,
						mintParam.property,
						mintParam.amount,
						mintParam.price
					)
			})
			it('generate event', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const filter = sTokensManager.filters.Transfer()
				const events = await sTokensManager.queryFilter(filter)
				const from = events[0].args!.from
				const to = events[0].args!.to
				const tokenId = events[0].args!.tokenId.toString()
				expect(from).to.equal(constants.AddressZero)
				expect(to).to.equal(mintParam.owner)
				expect(tokenId).to.equal('1')
			})
			it('The counter will be incremented.', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const filter = sTokensManager.filters.Transfer()
				const events = await sTokensManager.queryFilter(filter)
				const tokenId = events[0].args!.tokenId.toString()
				expect(tokenId).to.equal('1')
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const eventsSecound = await sTokensManager.queryFilter(filter)
				const tokenIdSecound = eventsSecound[1].args!.tokenId.toString()
				expect(tokenIdSecound).to.equal('2')
			})
		})
		describe('fail', () => {
			it('If the owner runs it, an error will occur.', async () => {
				const [sTokensManager] = await init()
				const mintParam = createMintParams()
				await expect(
					sTokensManager.mint(
						mintParam.owner,
						mintParam.property,
						mintParam.amount,
						mintParam.price
					)
				).to.be.revertedWith('illegal access')
			})
			it('If the user runs it, an error will occur.', async () => {
				const [, sTokensManagerUser] = await init()
				const mintParam = createMintParams()
				await expect(
					sTokensManagerUser.mint(
						mintParam.owner,
						mintParam.property,
						mintParam.amount,
						mintParam.price
					)
				).to.be.revertedWith('illegal access')
			})
		})
	})
	describe('update', () => {
		describe('success', () => {
			it('update data', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const latestTokenId = await lockup.latestTokenId()
				const beforePosition = await sTokensManager.positions(latestTokenId)
				expect(beforePosition[0]).to.equal(mintParam.property)
				expect(beforePosition[1].toNumber()).to.equal(mintParam.amount)
				expect(beforePosition[2].toNumber()).to.equal(mintParam.price)
				expect(beforePosition[3].toNumber()).to.equal(0)
				expect(beforePosition[4].toNumber()).to.equal(0)
				const updateParam = createUpdateParams(latestTokenId)
				await lockup.executeUpdate(
					updateParam.tokenId,
					updateParam.amount,
					updateParam.price,
					updateParam.cumulativeReward,
					updateParam.pendingReward
				)
				const afterPosition = await sTokensManager.positions(
					updateParam.tokenId
				)
				expect(afterPosition[0]).to.equal(mintParam.property)
				expect(afterPosition[1].toNumber()).to.equal(updateParam.amount)
				expect(afterPosition[2].toNumber()).to.equal(updateParam.price)
				expect(afterPosition[3].toNumber()).to.equal(
					updateParam.cumulativeReward
				)
				expect(afterPosition[4].toNumber()).to.equal(updateParam.pendingReward)
			})

			it('generate updated event data', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const latestTokenId = await lockup.latestTokenId()
				const updateParam = createUpdateParams(latestTokenId)
				await expect(
					await lockup.executeUpdate(
						updateParam.tokenId,
						updateParam.amount,
						updateParam.price,
						updateParam.cumulativeReward,
						updateParam.pendingReward
					)
				)
					.to.emit(sTokensManager, 'Updated')
					.withArgs(
						updateParam.tokenId,
						updateParam.amount,
						updateParam.price,
						updateParam.cumulativeReward,
						updateParam.pendingReward
					)
			})
		})
		describe('fail', () => {
			it('If the owner runs it, an error will occur.', async () => {
				const [sTokensManager] = await init()
				const updateParam = createUpdateParams()
				await expect(
					sTokensManager.update(
						updateParam.tokenId,
						updateParam.amount,
						updateParam.price,
						updateParam.cumulativeReward,
						updateParam.pendingReward
					)
				).to.be.revertedWith('illegal access')
			})
			it('If the user runs it, an error will occur.', async () => {
				const [, sTokensManagerUser] = await init()
				const updateParam = createUpdateParams()
				await expect(
					sTokensManagerUser.update(
						updateParam.tokenId,
						updateParam.amount,
						updateParam.price,
						updateParam.cumulativeReward,
						updateParam.pendingReward
					)
				).to.be.revertedWith('illegal access')
			})
			it('The data to be updated does not exist.', async () => {
				const [, , lockup] = await init()
				const updateParam = createUpdateParams(193746)
				await expect(
					lockup.executeUpdate(
						updateParam.tokenId,
						updateParam.amount,
						updateParam.price,
						updateParam.cumulativeReward,
						updateParam.pendingReward
					)
				).to.be.revertedWith(HARDHAT_ERROR)
			})
		})
	})

	describe('position', () => {
		describe('success', () => {
			it('get data', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const position = await sTokensManager.positions(1)
				expect(position[0]).to.equal(mintParam.property)
				expect(position[1].toNumber()).to.equal(mintParam.amount)
				expect(position[2].toNumber()).to.equal(mintParam.price)
				expect(position[3].toNumber()).to.equal(0)
				expect(position[4].toNumber()).to.equal(0)
			})
		})
		describe('fail', () => {
			it('deta is not found', async () => {
				const [sTokensManager] = await init()
				await expect(sTokensManager.positions(12345)).to.be.revertedWith(
					HARDHAT_ERROR
				)
			})
		})
	})
	describe('rewards', () => {
		describe('success', () => {
			it('get reward', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.setCalculateWithdrawableInterestAmountByPosition(1, 100)
				const position = await sTokensManager.rewards(1)
				expect(position[0].toNumber()).to.equal(100)
				expect(position[1].toNumber()).to.equal(0)
				expect(position[2].toNumber()).to.equal(100)
			})
			it('get updated reward', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const updateParam = createUpdateParams()
				await lockup.executeUpdate(
					updateParam.tokenId,
					updateParam.amount,
					updateParam.price,
					updateParam.cumulativeReward,
					updateParam.pendingReward
				)

				await lockup.setCalculateWithdrawableInterestAmountByPosition(1, 10000)
				const position = await sTokensManager.rewards(1)
				expect(position[0].toNumber()).to.equal(10300)
				expect(position[1].toNumber()).to.equal(300)
				expect(position[2].toNumber()).to.equal(10000)
			})
		})
		describe('fail', () => {
			it('deta is not found', async () => {
				const [sTokensManager] = await init()
				await expect(sTokensManager.rewards(12345)).to.be.revertedWith(
					HARDHAT_ERROR
				)
			})
		})
	})
	describe('positionsOfProperty', () => {
		describe('success', () => {
			it('get token id', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const tokenIds = await sTokensManager.positionsOfProperty(
					mintParam.property
				)
				expect(tokenIds.length).to.equal(1)
				expect(tokenIds[0].toNumber()).to.equal(1)
			})
			it('get token by property', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const mintParam2 = createMintParams()
				await lockup.executeMint(
					mintParam2.owner,
					mintParam2.property,
					mintParam2.amount,
					mintParam2.price,
					{
						gasLimit: 1200000,
					}
				)
				const tokenIds = await sTokensManager.positionsOfProperty(
					mintParam.property
				)
				expect(tokenIds.length).to.equal(1)
				expect(tokenIds[0].toNumber()).to.equal(1)
				const tokenIds2 = await sTokensManager.positionsOfProperty(
					mintParam2.property
				)
				expect(tokenIds2.length).to.equal(1)
				expect(tokenIds2[0].toNumber()).to.equal(2)
			})
			it('get token list', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const tokenIds = await sTokensManager.positionsOfProperty(
					mintParam.property
				)
				expect(tokenIds.length).to.equal(2)
				expect(tokenIds[0].toNumber()).to.equal(1)
				expect(tokenIds[1].toNumber()).to.equal(2)
			})
			it('return empty array', async () => {
				const [sTokensManager] = await init()
				const tokenIds = await sTokensManager.positionsOfProperty(
					constants.AddressZero
				)
				expect(tokenIds.length).to.equal(0)
			})
		})
	})
	describe('positionsOfOwner', () => {
		describe('success', () => {
			it('get token id', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const tokenIds = await sTokensManager.positionsOfOwner(mintParam.owner)
				expect(tokenIds.length).to.equal(1)
				expect(tokenIds[0].toNumber()).to.equal(1)
			})
			it('get token by owners', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const mintParam2 = createMintParams()
				await lockup.executeMint(
					mintParam2.owner,
					mintParam2.property,
					mintParam2.amount,
					mintParam2.price,
					{
						gasLimit: 1200000,
					}
				)
				const tokenIds = await sTokensManager.positionsOfOwner(mintParam.owner)
				expect(tokenIds.length).to.equal(1)
				expect(tokenIds[0].toNumber()).to.equal(1)
				const tokenIds2 = await sTokensManager.positionsOfOwner(
					mintParam2.owner
				)
				expect(tokenIds2.length).to.equal(1)
				expect(tokenIds2[0].toNumber()).to.equal(2)
			})
			it('get token list', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.executeMint(
					mintParam.owner,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				const tokenIds = await sTokensManager.positionsOfOwner(mintParam.owner)
				expect(tokenIds.length).to.equal(2)
				expect(tokenIds[0].toNumber()).to.equal(1)
				expect(tokenIds[1].toNumber()).to.equal(2)
			})
			it('return empty array', async () => {
				const [sTokensManager] = await init()
				const tokenIds = await sTokensManager.positionsOfOwner(
					constants.AddressZero
				)
				expect(tokenIds.length).to.equal(0)
			})
			it('transfer token(index0)', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				const [deployer, user] = await ethers.getSigners()
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await sTokensManager.transferFrom(deployer.address, user.address, 1)
				const tokenIds = await sTokensManager.positionsOfOwner(deployer.address)
				expect(tokenIds.length).to.equal(2)
				expect(tokenIds[0].toNumber()).to.equal(2)
				expect(tokenIds[1].toNumber()).to.equal(3)
				const tokenIdsUser = await sTokensManager.positionsOfOwner(user.address)
				expect(tokenIdsUser.length).to.equal(1)
				expect(tokenIdsUser[0].toNumber()).to.equal(1)
			})
			it('transfer token(index1)', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				const [deployer, user] = await ethers.getSigners()
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await sTokensManager.transferFrom(deployer.address, user.address, 2)
				const tokenIds = await sTokensManager.positionsOfOwner(deployer.address)
				expect(tokenIds.length).to.equal(2)
				if (tokenIds[0] === 2) {
					expect(tokenIds[1]).to.equal(3)
				} else if (tokenIds[0] === 3) {
					expect(tokenIds[1]).to.equal(2)
				} else {
					expect(true).to.equal(false)
				}

				const tokenIdsUser = await sTokensManager.positionsOfOwner(user.address)
				expect(tokenIdsUser.length).to.equal(1)
				expect(tokenIdsUser[0].toNumber()).to.equal(2)
			})
			it('transfer token(index2)', async () => {
				const [sTokensManager, , lockup] = await init()
				const mintParam = createMintParams()
				const [deployer, user] = await ethers.getSigners()
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)
				await lockup.executeMint(
					deployer.address,
					mintParam.property,
					mintParam.amount,
					mintParam.price,
					{
						gasLimit: 1200000,
					}
				)

				await sTokensManager.transferFrom(deployer.address, user.address, 3)
				const tokenIds = await sTokensManager.positionsOfOwner(deployer.address)
				expect(tokenIds.length).to.equal(2)
				expect(tokenIds[0].toNumber()).to.equal(1)
				expect(tokenIds[1].toNumber()).to.equal(2)
				const tokenIdsUser = await sTokensManager.positionsOfOwner(user.address)
				expect(tokenIdsUser.length).to.equal(1)
				expect(tokenIdsUser[0].toNumber()).to.equal(3)
			})
		})
	})
})
