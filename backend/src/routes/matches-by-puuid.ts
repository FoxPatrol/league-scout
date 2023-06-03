import { SummonersMatchesRelationsData } from '../interface/interfaces';
import express, { Request, Response, Router } from 'express';
import axios from 'axios';

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config(); // Load environment variables from .env file
const riotApiKey = process.env.RIOT_API_KEY;
const riotEndpointMatchesByPuuidPreProcess = process.env.RIOT_ENDPOINT_MATCHES_BY_PUUID;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE;
const collectionSummonersMatchesRelations = process.env.MONGODB_COLLECTION_SUMMONERS_MATCHES_RELATIONS;

const router: Router = express.Router();

// Create a new MongoClient
const client = new MongoClient(mongoUri!);

// Define your routes

// Get matches data specific to a puuid
router.get('/matches/by-puuid/:puuid', async (req: Request, res: Response) => {
  const puuid = req.params.puuid; // Get the puuid from the route parameter
  console.log("get /matches/by-puuid/" + puuid)
  const riotEndpointMatchesByPuuid = riotEndpointMatchesByPuuidPreProcess?.replace("{puuid}", puuid);

  const db = client.db(dbName!);
  const collection = db.collection(collectionSummonersMatchesRelations!);

  // Look for summoner puuid in database
  try {
    console.log("Looking for " + puuid + " in database.")
    // Get the database and collection
    await client.connect();

    // Check if summoner data exists in the database
    //@ts-ignore
    const existingMatchesData = await collection.findOne({'_id': puuid});

    // If exist, send data from database
    if (existingMatchesData) {
      console.log("Found " + puuid + " in database.")

      client.close();
      res.send(existingMatchesData)
      return;
    }

    // does not exist in database, proceed to API request
    console.log("Did not find " + puuid + " in database.")
    client.close();

  } catch (error) {
    console.error("Error getting data from database", error)
    client.close();
  }

  // Look for matches by puuid in API
  try {
    console.log("Looking for matches by puuid " + puuid + " in API.")
    const response = await axios.get(`${riotEndpointMatchesByPuuid}`, {
      headers: {
        'X-Riot-Token': riotApiKey
      }
    });
    const matchesData: SummonersMatchesRelationsData = {
      //@ts-ignore
      _id: puuid,
      timestamp: new Date(),
      matches: response.data
    }

    try {
      // Insert new data into the collection
      await client.connect();
      const confirmation = await collection.insertOne(matchesData);
      if(confirmation.acknowledged)
      {
        console.log('Matches data related to ' + puuid + ' inserted successfully in database.');
      }
      else
      {
        console.error(puuid + ' could not be inserted in database.');
      }
      client.close();
    } catch (error) {
      console.error('Error inserting ' + puuid + ' in database.', error);
      client.close();
    }

    // Send data gathered from API
    res.send(matchesData)
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