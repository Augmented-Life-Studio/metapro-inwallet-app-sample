import {LeaderboardTotalScoreResponse} from '@/config/types'

/**
 * Fetches the total leaderboard points for a specific user from the MetaPro Protocol leaderboard service.
 *
 * This function sends an HTTP GET request to the MetaPro Protocol API to retrieve the total score
 * for a user in a specific leaderboard. The leaderboard ID, user ID, and API key are included
 * in the request as query parameters and headers.
 *
 * @param {string} userId - The unique identifier of the user whose leaderboard points are being fetched.
 *
 * @returns {Promise<LeaderboardTotalScoreResponse>} - A promise that resolves to the user's total leaderboard score,
 * returned as a `LeaderboardTotalScoreResponse` object.
 *
 * @throws {Error} - If the fetch operation fails, the promise may reject with an error indicating the failure of the request.
 *
 * @example
 * const userId = "123456789";
 *
 * fetchLeaderboardUserPoints(userId)
 *   .then((leaderboardData) => {
 *     console.log('User leaderboard points:', leaderboardData);
 *   })
 *   .catch((error) => {
 *     console.error('Error fetching leaderboard points:', error);
 *   });
 */
export const fetchLeaderboardUserPoints = async (
	userId: string,
): Promise<LeaderboardTotalScoreResponse> => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_LEADERBOARD_SERVICE_URL}/score-total/get?leaderboardId=${process.env.NEXT_PUBLIC_LEADERBOARD_ID}&userId=${userId}`,
		{
			headers: {
				leaderboardApiKey: `${process.env.NEXT_PUBLIC_LEADERBOARD_API_KEY}`,
			},
		},
	)
	return await response.json()
}

/**
 * Updates a user's leaderboard points in the MetaPro Protocol leaderboard service.
 *
 * This function sends an HTTP PUT request to the MetaPro Protocol API to update the total score
 * for a specific user in the leaderboard. The request includes the leaderboard ID, project ID,
 * and the updated score in the request body. The leaderboard API key is included in the headers
 * for authentication.
 *
 * @param {string} userId - The unique identifier of the user whose leaderboard points are being updated.
 * @param {number} points - The number of points to update the user's leaderboard score with.
 *
 * @returns {Promise<any>} - A promise that resolves to the response from the API, typically the updated leaderboard data.
 *
 * @throws {Error} - If the fetch operation fails, the promise may reject with an error indicating the failure of the request.
 *
 * @example
 * const userId = "123456789";
 * const points = 150;
 *
 * editLeaderboardUserPoints(userId, points)
 *   .then((updatedData) => {
 *     console.log('Leaderboard points updated:', updatedData);
 *   })
 *   .catch((error) => {
 *     console.error('Error updating leaderboard points:', error);
 *   });
 */
export const editLeaderboardUserPoints = async (
	userId: string,
	points: number,
) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_LEADERBOARD_SERVICE_URL}/score-total/${userId}`,
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

export const fetchLeaderboardPoints = async (
	params:
		| {
				limit?: number
				minBalance?: number
				maxBalance?: number
		  }
		| undefined,
): Promise<LeaderboardTotalScoreResponse[]> => {
	const requestParams = new URLSearchParams({
		limit: params?.limit ? params?.limit.toString() : '20',
		...(params?.minBalance && {minBalance: params.minBalance.toString()}),
		...(params?.maxBalance && {maxBalance: params.maxBalance.toString()}),
	}).toString()

	console.log(process.env.NEXT_PUBLIC_LEADERBOARD_API_KEY)

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_LEADERBOARD_SERVICE_URL}/score-total/leaderboard/${process.env.NEXT_PUBLIC_LEADERBOARD_ID}?${requestParams}`,
		{
			headers: {
				Accept: '*/*',
				'Content-Type': 'application/json',
				leaderboardApiKey: `${process.env.NEXT_PUBLIC_LEADERBOARD_API_KEY}`,
			},
		},
	)
	return await response.json()
}
