import express, { Request, Response, Router } from 'express';
import axios from 'axios';

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config(); // Load environment variables from .env file
const riotApiKey = process.env.RIOT_API_KEY;
const riotEndpointMatchesTimelinePreProcess = process.env.RIOT_ENDPOINT_MATCHES_TIMELINE;

const router: Router = express.Router();

// Define your routes

// Get timeline from matchId
router.get('/matches/:matchId/timeline', async (req: Request, res: Response) => {
  const matchId = req.params.matchId; // Get the puuid from the route parameter
  console.log("get /matches/" + matchId + "/timeline")
  const riotEndpointMatchesTimeline = riotEndpointMatchesTimelinePreProcess?.replace("{matchId}", matchId);

  // Look for matches timeline by match id in API
  try {
    console.log("Looking for match timeline by matchId " + matchId + " in API.")
    const response = await axios.get(`${riotEndpointMatchesTimeline}`, {
      headers: {
        'X-Riot-Token': riotApiKey
      }
    });
    const matchTimeline: any = {
      //@ts-ignore
      _id: matchId,
      timestamp: new Date(),
      metadata: response.data.metadata,
      info: response.data.info
    }

    // Send data gathered from API
    res.send(matchTimeline)
    return;

  } catch (e: any) {
    // Failed to retrieve any data from both database and API
    const statusCode = e.response ? e.response.status : 500;
    console.error('Error ' + statusCode + ' occurred while fetching match timeline data.');
    res.status(statusCode).send('Error ' + statusCode + ' occurred while fetching match timeline data.');
    return;
  }
});

export default router;