import {User} from '@/config/types'
import {fetchWalletNftMetaAssets} from '@/functions/nft-service'
import {editUser} from '@/functions/user-service'
import {useState, useEffect} from 'react'
import {
	ModalWrapper,
	SettingsCloseButton,
	ModalContent,
	FlexColumn,
	FlexRow,
	UseNftButton,
	TrashButton,
	UserDetailsTitle,
	UserDetails,
} from './UserPage'
import Image from 'next/image'

export const UserDetailsModal: React.FC<{
	user: User
	closeModal: () => void
	refetchUser: () => void
}> = ({user, closeModal, refetchUser}) => {
	const [nftList, setNftList] = useState([])
	const [showNftList, setShowNftList] = useState(false)

	const userAddresses = user?.addresses

	useEffect(() => {
		if (!user?.addresses[0]?.wallet) return
		const fetchNftList = async () => {
			const nftList = await fetchWalletNftMetaAssets(user.addresses[0].wallet)
			setNftList(nftList.results)
		}
		fetchNftList()
	}, [userAddresses])

	return (
		<ModalWrapper onClick={e => e.stopPropagation()}>
			<SettingsCloseButton onClick={closeModal} />
			<ModalContent>
				{showNftList ? (
					<FlexColumn style={{padding: '22px', height: '100%', width: '100%'}}>
						<FlexRow>
							<div>Select NFTMA</div>
							<div onClick={() => setShowNftList(false)}>BACK</div>
						</FlexRow>
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								height: '100%',
								width: '100%',
								overflowY: 'scroll',
							}}
						>
							{nftList.map((nft: any) => (
								<Image
									key={nft.token?._tokenId}
									src={nft.token.image || ''}
									alt=''
									width={88}
									height={88}
									style={{margin: '5px', borderRadius: '10px'}}
									onClick={async () => {
										const updatedUser = {
											...user,
											personalDetails: {
												...user.personalDetails,
												avatar: nft.token.image,
											},
										}
										await editUser(updatedUser)
										setShowNftList(false)
										refetchUser()
									}}
								/>
							))}
						</div>
					</FlexColumn>
				) : (
					<>
						{user?.personalDetails?.avatar ? (
							<Image
								src={user?.personalDetails?.avatar || ''}
								alt='avatar'
								width={146}
								height={146}
								style={{borderRadius: '20px'}}
							/>
						) : (
							<div
								style={{
									backgroundColor: 'gray',
									width: '146px',
									height: '146px',
									borderRadius: '20px',
								}}
							></div>
						)}
						<FlexRow style={{margin: '10px 0 10px 0'}}>
							<UseNftButton
								onClick={() => setShowNftList(true)}
								style={{marginRight: '10px'}}
							/>
							<TrashButton
								onClick={async () => {
									const updatedUser = {
										...user,
										personalDetails: {
											...user.personalDetails,
										},
									}
									delete updatedUser.personalDetails.avatar
									await editUser(updatedUser)
									setShowNftList(false)
									refetchUser()
								}}
							/>
						</FlexRow>
						<UserDetailsTitle>Wallet address</UserDetailsTitle>
						<UserDetails>{user?.addresses[0].wallet}</UserDetails>
						<UserDetailsTitle>METAPRO ID</UserDetailsTitle>
						<UserDetails>{user.userId}</UserDetails>
					</>
				)}
			</ModalContent>
		</ModalWrapper>
	)
}
