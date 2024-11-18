'use client'
import {useEffect, useState} from 'react'
import {useParams} from 'next/navigation'
import {User} from '@/config/types'
import Image from 'next/image'
import {
	PageWrapper,
	TopBar,
	SettingsButton,
	AccountBox,
	AvatarBox,
	FlexRow,
	FlexColumn,
	PointsButton,
	LeaderboardButton,
	MintTokensButton,
} from '@/components/UserPage'
import {fatchUserData} from '@/functions/user-service'
import {
	fetchLeaderboardUserPoints,
	editLeaderboardUserPoints,
} from '@/functions/leaderboard-service'
import {UserDetailsModal} from '@/components/UserDetailsModal'
import {LeaderboardModal} from '@/components/LeaderboardModal'
import {MintingModal} from '@/components/MintingModal'
import {useRouter} from 'next/router'

enum ModalType {
	USER = 'user',
	LEADERBOARD = 'leaderboard',
	MINTING = 'minting',
}

export default function Account() {
	const params = useParams()
	const {push} = useRouter()

	const [loadingUser, setLoadingUser] = useState(true)
	const [user, setUser] = useState<User>()
	const [points, setPoints] = useState(0)

	const [modalState, setModalState] = useState<Record<ModalType, boolean>>({
		[ModalType.USER]: false,
		[ModalType.LEADERBOARD]: false,
		[ModalType.MINTING]: false,
	})

	// Lead user to home page if account is changed
	useEffect(() => {
		if (!window.ethereum) return
		window.ethereum.on('accountsChanged', async (accounts: string[]) => {
			push('/')
		})
	}, [])

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
			const points = await fetchLeaderboardUserPoints(userId)
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

	const triggerModal = (event: any) => {
		const type = event.target.id as ModalType
		event.stopPropagation()
		setModalState(prev => {
			let state = prev as Record<ModalType, boolean>
			// If modal to trigger is closed we want to close another modals and open the one we want
			Object.values(ModalType).forEach(key => {
				if (key !== type) state[key.toLowerCase() as ModalType] = false
				else state[type] = !prev[type]
			})
			return {
				...prev,
				...state,
			}
		})
	}

	const closeModals = () => {
		setModalState(prev => ({
			...prev,
			[ModalType.USER]: false,
			[ModalType.LEADERBOARD]: false,
			[ModalType.MINTING]: false,
		}))
	}

	return (
		<PageWrapper
			onClick={e => {
				e.stopPropagation()
				// Close all modals on click
				closeModals()
			}}
		>
			{modalState[ModalType.USER] && user ? (
				<UserDetailsModal
					{...{
						user,
						closeModal: () =>
							setModalState(prev => ({
								...prev,
								[ModalType.USER]: false,
							})),
						refetchUser: () => fetchUser(user.userId),
					}}
				/>
			) : null}
			{modalState[ModalType.LEADERBOARD] ? (
				<LeaderboardModal
					{...{
						closeModal: () =>
							setModalState(prev => ({
								...prev,
								[ModalType.LEADERBOARD]: false,
							})),
					}}
				/>
			) : null}
			{modalState[ModalType.MINTING] ? (
				<MintingModal
					{...{
						closeModal: () =>
							setModalState(prev => ({
								...prev,
								[ModalType.MINTING]: false,
							})),
					}}
				/>
			) : null}
			<TopBar>
				{loadingUser ? (
					<>LOADING...</>
				) : (
					<>
						<SettingsButton id={ModalType.USER} onClick={triggerModal} />
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
			<FlexColumn
				style={{
					height: '100%',
					justifyContent: 'flex-end',
					paddingBottom: '80px',
				}}
			>
				<FlexRow style={{marginBottom: '20px'}}>TOTAL POINTS</FlexRow>

				<FlexRow style={{justifyContent: 'center', marginBottom: '20px'}}>
					<PointsButton
						onClick={async () => {
							if (user) {
								await editLeaderboardUserPoints(user.userId, -1)
								fetchPoints(user.userId)
							}
						}}
						type='REDUCE'
					/>
					<FlexRow style={{margin: '0px 30px'}}> {points}</FlexRow>
					<PointsButton
						onClick={async () => {
							if (user) {
								await editLeaderboardUserPoints(user.userId, 1)
								fetchPoints(user.userId)
							}
						}}
						type='ADD'
					/>
				</FlexRow>
				<LeaderboardButton id={ModalType.LEADERBOARD} onClick={triggerModal} />
				<FlexRow style={{margin: '10px 0'}} />
				<MintTokensButton id={ModalType.MINTING} onClick={triggerModal} />
			</FlexColumn>
		</PageWrapper>
	)
}
