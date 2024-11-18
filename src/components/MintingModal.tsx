import {useState, useEffect} from 'react'
import {
	ModalWrapper,
	SettingsCloseButton,
	ModalContent,
	FlexColumn,
} from './UserPage'
import Image from 'next/image'
import Web3 from 'web3'
import {fetchNftByContractAddress} from '@/functions/nft-service'
import {contractABI} from '@/config/contractABI'

const contractConfig = {
	address: '0xD34cec96549cfC822cb44FE2971554C130315eE3',
	chainId: 84532,
	rpc: 'https://base-sepolia-rpc.publicnode.com',
}

export const MintingModal: React.FC<{
	closeModal: () => void
}> = ({closeModal}) => {
	const [nftList, setNftList] = useState<any[]>([])
	const [mintInProgress, setMintInProgress] = useState(false)

	const windowWeb3 = new Web3(window?.ethereum as any)

	const triggerMint = async (_tokenId: number) => {
		setMintInProgress(true)
		// Create a new contract instance with the ABI and contract address
		const contract = new windowWeb3.eth.Contract(
			contractABI,
			contractConfig.address,
		)
		const currentChainId = (await windowWeb3.eth.getChainId()).toString()
		const [currentAccount] = await windowWeb3.eth.getAccounts()
		// ABI is the contract's interface, which defines the functions and events that the contract exposes. We can use as the ABI the function that we want to call on the contract by using the ABI.

		try {
			// Check if the current chain ID matches the chain ID of the contract
			if (currentChainId !== contractConfig.chainId.toString()) {
				// Once the chain ID is different, request the user to switch to the correct chain
				if (window?.ethereum?.request)
					await window?.ethereum.request({
						method: 'wallet_switchEthereumChain',
						params: [{chainId: '0x' + contractConfig.chainId.toString(16)}],
					})
			}
			// Call the mint function on the contract with the required parameters and send the transaction from the first account in the list
			const result = await contract.methods
				.mint(
					currentAccount, // _to
					Web3.utils.toHex(_tokenId), // _tokenId
					Web3.utils.toHex(1), // _amount
					Web3.utils.asciiToHex(''), // data
				)
				.send({from: currentAccount})
			return result
		} catch (error) {
			console.error(error)
		} finally {
			setMintInProgress(false)
		}
	}

	const fetchNftList = async () => {
		const nftList = await fetchNftByContractAddress(contractConfig.address)
		const simpleRpcProvider = new Web3.providers.HttpProvider(
			contractConfig.rpc,
		)
		// Create a new Web3 instance with the RPC provider
		const web3 = new Web3(simpleRpcProvider)
		// Create a new contract instance with the ABI and contract address
		const contract = new web3.eth.Contract(contractABI, contractConfig.address)

		const [currentAccount] = await windowWeb3.eth.getAccounts()

		const nftsWithBalances = await Promise.all(
			nftList.results.map(async (nft: any) => {
				const balance: bigint = await contract.methods
					.balanceOf(
						currentAccount, // account
						nft.token._tokenId, // _tokenId
					)
					.call()
				return {
					...nft,
					balance: Number(balance),
				}
			}),
		)
		setNftList(nftsWithBalances)
	}

	useEffect(() => {
		fetchNftList()
	}, [])

	return (
		<ModalWrapper onClick={e => e.stopPropagation()}>
			<SettingsCloseButton onClick={closeModal} />
			<ModalContent
				style={{
					justifyContent: 'flex-start',
					alignItems: 'flex-start',
					padding: '40px',
					height: '100%',
				}}
			>
				<FlexColumn>
					{!nftList.length ? (
						<div>Loading...</div>
					) : (
						<>
							{nftList.map((nft: any) => (
								<FlexColumn key={nft.id}>
									<Image
										key={nft.token?._tokenId}
										src={nft.token.image || ''}
										alt=''
										width={88}
										height={88}
										style={{
											margin: '5px',
											borderRadius: '10px',
											cursor: mintInProgress ? 'not-allowed' : 'pointer',
										}}
										onClick={async () => {
											await triggerMint(nft.token?._tokenId)
											await fetchNftList()
										}}
									/>
									<div>Balance: {nft.balance}</div>
								</FlexColumn>
							))}
						</>
					)}
				</FlexColumn>
			</ModalContent>
		</ModalWrapper>
	)
}
