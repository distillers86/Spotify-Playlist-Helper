/**
 * Service for authenticating with Spotify.
 */

const axios = require('axios');
const qs = require('qs');

let cachedToken = null;
let tokenExpiration = null;

async function getSpotifyAccessToken() {

	console.log('Grabbing Spotify Access Token.');

	const now = Date.now();

	if (cachedToken && tokenExpiration && now < tokenExpiration) {
		return cachedToken;
	}

	const tokenUrl = 'https://accounts.spotify.com/api/token';
	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

	const authOptions = {
		method: 'POST',
		url: tokenUrl,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
		},
		data: qs.stringify({
			grant_type: 'client_credentials',
		}),
	};


	try {
		const response = await axios(authOptions);
		cachedToken = response.data.access_token;
		tokenExpiration = now + response.data.expires_in * 1000;
		console.log("Spotify token successfully obtained.");
		return cachedToken;
	} catch (err) {
		console.error('Error fetching Spotify token:', err.response?.data || err.message);
		throw new Error('Failed to authenticate with Spotify');
	}


}

module.exports = { getSpotifyAccessToken }
