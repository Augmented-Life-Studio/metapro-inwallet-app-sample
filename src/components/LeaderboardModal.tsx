import {useState, useEffect} from 'react'
import {
	ModalWrapper,
	SettingsCloseButton,
	ModalContent,
	FlexRow,
} from './UserPage'
import {fetchLeaderboardPoints} from '@/functions/leaderboard-service'
import {fetchUsersProfiles} from '@/functions/user-service'
import {User} from '@/config/types'
import Image from 'next/image'
import styled from 'styled-components'

const UserDetailsRow = styled(FlexRow)`
	width: 80%;
	p {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
`

interface UserWithPoints extends User {
	score?: number
}

export const LeaderboardModal: React.FC<{
	closeModal: () => void
}> = ({closeModal}) => {
	const [leaderboardScores, setLeaderboardScores] = useState<UserWithPoints[]>(
		[],
	)

	useEffect(() => {
		const fetchLeaderboardUsers = async () => {
			const leaderboardScoresResponse = await fetchLeaderboardPoints({})
			const scoresUsers = await fetchUsersProfiles({
				userIds: leaderboardScoresResponse.map(score => score.userId),
			})
			const usersWithScores = scoresUsers.results
				.map(user => ({
					...user,
					score: leaderboardScoresResponse.find(
						score => score.userId === user.userId,
					)?.currentRoundData.score,
				}))
				.sort((a, b) => (b.score || 0) - (a.score || 0))

			setLeaderboardScores(usersWithScores)
		}
		fetchLeaderboardUsers()
	}, [])

	return (
		<ModalWrapper onClick={e => e.stopPropagation()}>
			<SettingsCloseButton onClick={closeModal} />
			<ModalContent
				style={{
					justifyContent: 'flex-start',
					alignItems: 'flex-start',
					padding: '40px',
				}}
			>
				<FlexRow>LEADERBOARD</FlexRow>
				{leaderboardScores.map((user, index) => (
					<FlexRow
						key={index}
						style={{justifyContent: 'space-between', width: '100%'}}
					>
						<UserDetailsRow>
							{index + 1}.
							<Image
								src={user.personalDetails?.avatar || ''}
								width={32}
								height={32}
								alt='avatar'
								style={{borderRadius: '30%', margin: '0px 15px'}}
							></Image>
							<p>{user.personalDetails?.username}</p>
						</UserDetailsRow>
						<FlexRow>{user.score} pkt</FlexRow>
					</FlexRow>
				))}
			</ModalContent>
		</ModalWrapper>
	)
}
