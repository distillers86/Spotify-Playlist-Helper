/**
 * This handles search functionality for finding songs from the Spotify API.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getSpotifyAccessToken } = require('../services/spotifyAuth');

router.get('/', async (req, res) => {

	const { query, artist } = req.query;

	if (!query && !artist) {
		return res.status(400).json({ error: 'Query or arist parameter is required.'});
	}

	const searchQuery = [query, artist].filter(Boolean).join(' ');

	try {
		const token = await getSpotifyAccessToken();

		console.log('Attempting to get song info from Spotify.');

		const response = await axios.get('https://api.spotify.com/v1/search', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			params: {
				q: searchQuery,
				type: 'track',
				limit: 10,
			},
		});

		const results = response.data.tracks.items.map(track => ({
			id: track.id,
			name: track.name,
			artist: track.artists.map(a => a.name).join(', '),
			album: track.album.name,
			albumArt: track.album.images?.[0]?.url || null,
			uri: track.uri,
		}));

		console.log('Song info found!');

		res.json(results);

	} catch (error) {
		console.error('Search failed: ', error.response?.data || error.message);
		res.status(500).json({ error: 'Failed to search tracks.' });
	}

})

module.exports = router;
