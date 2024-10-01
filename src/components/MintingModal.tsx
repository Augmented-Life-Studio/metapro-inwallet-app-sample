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

const CONTRACT_ADDRESS = '0xD34cec96549cfC822cb44FE2971554C130315eE3'

export const MintingModal: React.FC<{
	closeModal: () => void
}> = ({closeModal}) => {
	const [nftList, setNftList] = useState([])
	const [mintInProgress, setMintInProgress] = useState(false)

	const triggerMint = async (_tokenId: number) => {
		setMintInProgress(true)
		const web3 = new Web3(window?.ethereum as any)
		const accounts = await web3.eth.getAccounts()
		// Create a new contract instance with the ABI and contract address
		// ABI is the contract's interface, which defines the functions and events that the contract exposes. We can use as the ABI the function that we want to call on the contract by using the ABI.
		const contract = new web3.eth.Contract(
			[
				{
					inputs: [
						{
							internalType: 'address',
							name: '_to',
							type: 'address',
						},
						{
							internalType: 'uint256',
							name: '_tokenId',
							type: 'uint256',
						},
						{
							internalType: 'uint256',
							name: '_amount',
							type: 'uint256',
						},
						{
							internalType: 'bytes',
							name: 'data',
							type: 'bytes',
						},
					],
					name: 'mint',
					outputs: [],
					stateMutability: 'nonpayable',
					type: 'function',
				},
			],
			CONTRACT_ADDRESS,
		)
		try {
			// Call the mint function on the contract with the required parameters and send the transaction from the first account in the list
			const result = await contract.methods
				.mint(
					accounts[0],
					web3.utils.toHex(1),
					web3.utils.toHex(1),
					web3.utils.asciiToHex(''),
				)
				.send({from: accounts[0]})
			console.log(result)
		} catch (error) {
			console.error(error)
		} finally {
			setMintInProgress(false)
		}
	}

	useEffect(() => {
		const fetchNftList = async () => {
			const nftList = await fetchNftByContractAddress(CONTRACT_ADDRESS)
			setNftList(nftList.results)
		}
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
										triggerMint(nft.token?._tokenId)
									}}
								/>
							))}
						</>
					)}
				</FlexColumn>
			</ModalContent>
		</ModalWrapper>
	)
}
