import { SummonersMatchesRelationsData } from '../interface/interfaces';
import express, { Request, Response, Router } from 'express';
import axios from 'axios';

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config(); // Load environment variables from .env file
const riotApiKey = process.env.RIOT_API_KEY;
const riotEndpointMatchesPreProcess = process.env.RIOT_ENDPOINT_MATCHES;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE;
const collectionMatches = process.env.MONGODB_COLLECTION_MATCHES;

const router: Router = express.Router();

// Create a new MongoClient
const client = new MongoClient(mongoUri!);

// Define your routes

// Get matches by matchId
router.get('/matches/:matchId', async (req: Request, res: Response) => {
  const matchId = req.params.matchId; // Get the puuid from the route parameter
  console.log("get /matches/" + matchId)
  const riotEndpointMatches = riotEndpointMatchesPreProcess?.replace("{matchId}", matchId);

  const db = client.db(dbName!);
  const collection = db.collection(collectionMatches!);

  // Look for match id in database
  try {
    console.log("Looking for " + matchId + " in database.")
    // Get the database and collection
    await client.connect();

    // Check if summoner data exists in the database
    //@ts-ignore
    const existingMatchesData = await collection.findOne({'_id': matchId});

    // If exist, send data from database
    if (existingMatchesData) {
      console.log("Found " + matchId + " in database.")

      client.close();
      res.send(existingMatchesData)
      return;
    }

    // does not exist in database, proceed to API request
    console.log("Did not find " + matchId + " in database.")
    client.close();

  } catch (error) {
    console.error("Error getting data from database", error)
    client.close();
  }

  // Look for matches by match id in API
  try {
    console.log("Looking for matches by matchId " + matchId + " in API.")
    const response = await axios.get(`${riotEndpointMatches}`, {
      headers: {
        'X-Riot-Token': riotApiKey
      }
    });
    const matchData: any = {
      //@ts-ignore
      _id: matchId,
      timestamp: new Date(),
      metadata: response.data.metadata,
      info: response.data.info
    }

    try {
      // Insert new data into the collection
      await client.connect();
      const confirmation = await collection.insertOne(matchData);
      if(confirmation.acknowledged)
      {
        console.log('Match data related to ' + matchId + ' inserted successfully in database.');
      }
      else
      {
        console.error(matchId + ' could not be inserted in database.');
      }
      client.close();
    } catch (error) {
      console.error('Error inserting ' + matchId + ' in database.', error);
      client.close();
    }

    // Send data gathered from API
    res.send(matchData)
    return;

  } catch (e: any) {
    // Failed to retrieve any data from both database and API
    const statusCode = e.response ? e.response.status : 500;
    console.error('Error ' + statusCode + ' occurred while fetching matches data.');
    res.status(statusCode).send('Error ' + statusCode + ' occurred while fetching matches data.');
    return;
  }
});

export default router;