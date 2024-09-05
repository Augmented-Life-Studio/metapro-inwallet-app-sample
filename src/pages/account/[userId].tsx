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
} from '@/components/UserPage'
import {fatchUserData} from '@/functions/user-service'
import {
	fetchLeaderboardUserPoints,
	editLeaderboardUserPoints,
} from '@/functions/leaderboard-service'
import {UserDetailsModal} from '@/components/UserDetailsModal'
import {LeaderboardModal} from '@/components/LeaderboardModal'

export default function Account() {
	const params = useParams()

	const [loadingUser, setLoadingUser] = useState(true)
	const [user, setUser] = useState<User>()
	const [isUserModalOpen, setIsUserModalOpen] = useState(false)
	const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false)
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

	return (
		<PageWrapper
			onClick={e => {
				e.stopPropagation()
				if (isUserModalOpen) setIsUserModalOpen(false)
			}}
		>
			{isUserModalOpen && user ? (
				<UserDetailsModal
					{...{
						user,
						closeModal: () => setIsUserModalOpen(false),
						refetchUser: () => fetchUser(user.userId),
					}}
				/>
			) : null}
			{isLeaderboardModalOpen ? (
				<LeaderboardModal
					{...{
						closeModal: () => setIsLeaderboardModalOpen(false),
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
								setIsUserModalOpen(prev => !prev)
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
				<LeaderboardButton onClick={() => setIsLeaderboardModalOpen(true)} />
			</FlexColumn>
		</PageWrapper>
	)
}
