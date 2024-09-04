'use client'
import {useEffect, useState} from 'react'
import {useParams} from 'next/navigation'
import {User} from '@/config/types'
import Image from 'next/image'
import {
	ModalWrapper,
	ModalContent,
	SettingsCloseButton,
	UserDetails,
	PageWrapper,
	TopBar,
	SettingsButton,
	AccountBox,
	AvatarBox,
	UserDetailsTitle,
	FlexRow,
	FlexColumn,
	StyledButton,
	UseNftButton,
	TrashButton,
} from '@/components/UserPage'
import {fetchWalletNftMetaAssets} from '@/functions/nft-service'
import {editUser, fatchUserData} from '@/functions/user-service'
import {
	fetchLeaderboardPoints,
	editLeaderboardPoints,
} from '@/functions/leaderboard-service'

const UserDetailsModal: React.FC<{
	user: User
	closeModal: () => void
	refetchUser: () => void
}> = ({user, closeModal, refetchUser}) => {
	const [nftList, setNftList] = useState([])
	const [showNftList, setShowNftList] = useState(false)

	useEffect(() => {
		if (!user?.addresses[0]?.wallet) return
		const fetchNftList = async () => {
			const nftList = await fetchWalletNftMetaAssets(user.addresses[0].wallet)
			console.log(nftList)
			setNftList(nftList.results)
		}
		fetchNftList()
	}, [user?.addresses[0]?.wallet])

	return (
		<ModalWrapper onClick={e => e.stopPropagation()}>
			<SettingsCloseButton onClick={closeModal} />
			<ModalContent>
				{showNftList ? (
					<FlexColumn style={{padding: '22px', height: '100%'}}>
						<FlexRow>
							<div>Select NFTMA</div>
							<div onClick={() => setShowNftList(false)}>BACK</div>
						</FlexRow>
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								height: '100%',
								overflowY: 'scroll',
							}}
						>
							{nftList.map((nft: any) => (
								<Image
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

export default function Account() {
	const params = useParams()

	const [loadingUser, setLoadingUser] = useState(true)
	const [user, setUser] = useState<User>()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [points, setPoints] = useState(0)

	const fetchUser = async (userId: string) => {
		try {
			const user = await fatchUserData(userId)
			setUser(user)
			return user
		} catch (error) {
			console.error(error)
		} finally {
			setLoadingUser(false)
		}
	}

	const fetchPoints = async (userId: string) => {
		try {
			const points = await fetchLeaderboardPoints(userId)
			setPoints(points?.currentRoundData.score)
			return points
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		if (!params?.userId) return
		fetchUser(params?.userId as string)
		fetchPoints(params?.userId as string)
	}, [params?.userId])

	return (
		<PageWrapper
			onClick={e => {
				e.stopPropagation()
				if (isModalOpen) setIsModalOpen(false)
			}}
		>
			{isModalOpen && user ? (
				<UserDetailsModal
					{...{
						user,
						closeModal: () => setIsModalOpen(false),
						refetchUser: () => fetchUser(user.userId),
					}}
				/>
			) : null}
			<TopBar>
				{loadingUser ? (
					<>LOADING...</>
				) : (
					<>
						<SettingsButton
							onClick={e => {
								e.stopPropagation()
								setIsModalOpen(prev => !prev)
							}}
						/>
						<AccountBox>
							<AvatarBox>
								{user?.personalDetails?.avatar ? (
									<Image
										src={user?.personalDetails?.avatar || ''}
										alt='avatar'
										width={25}
										height={25}
										style={{borderRadius: '5px'}}
									/>
								) : (
									<div
										style={{
											backgroundColor: 'gray',
											width: '25px',
											height: '25px',
											borderRadius: '5px',
										}}
									></div>
								)}
							</AvatarBox>

							<p>{user?.personalDetails?.username || 'Your nickname'}</p>
						</AccountBox>
					</>
				)}
			</TopBar>
			<FlexColumn>
				<FlexRow style={{marginBottom: '20px'}}>TOTAL POINTS: {points}</FlexRow>
				<FlexRow style={{justifyContent: 'center'}}>
					<StyledButton
						onClick={async () => {
							if (user) {
								await editLeaderboardPoints(user.userId, -1)
								fetchPoints(user.userId)
							}
						}}
					>
						REDUCE POINT
					</StyledButton>
					<StyledButton
						onClick={async () => {
							if (user) {
								await editLeaderboardPoints(user.userId, 1)
								fetchPoints(user.userId)
							}
						}}
					>
						ADD POINT
					</StyledButton>
				</FlexRow>
			</FlexColumn>
		</PageWrapper>
	)
}
