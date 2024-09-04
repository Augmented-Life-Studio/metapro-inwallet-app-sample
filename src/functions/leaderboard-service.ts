import {LeaderboardTotalScoreResponse} from '@/config/types'

export const fetchLeaderboardPoints = async (
	userId: string,
): Promise<LeaderboardTotalScoreResponse> => {
	const response = await fetch(
		`https://test-api.metaproprotocol.com/ms/leaderboard/score-total/get?leaderboardId=${process.env.NEXT_PUBLIC_LEADERBOARD_ID}&userId=${userId}`,
		{
			headers: {
				leaderboardApiKey: `${process.env.NEXT_PUBLIC_LEADERBOARD_API_KEY}`,
			},
		},
	)
	return await response.json()
}

export const editLeaderboardPoints = async (userId: string, points: number) => {
	const response = await fetch(
		`https://test-api.metaproprotocol.com/ms/leaderboard/score-total/${userId}`,
		{
			method: 'PUT',
			headers: {
				Accept: '*/*',
				'Content-Type': 'application/json',
				leaderboardApiKey: `${process.env.NEXT_PUBLIC_LEADERBOARD_API_KEY}`,
			},
			body: JSON.stringify({
				leaderboardId: process.env.NEXT_PUBLIC_LEADERBOARD_ID,
				projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
				referralSettingsId: '',
				roundData: {
					score: points,
				},
			}),
		},
	)
	return await response.json()
}
