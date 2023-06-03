import { SummonerData, SummonerDTO } from '../interface/interfaces';
import express, { Request, Response, Router } from 'express';
import axios from 'axios';

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config(); // Load environment variables from .env file
const riotApiKey = process.env.RIOT_API_KEY;
const riotEndpointSummonerByNamePreProcess = process.env.RIOT_ENDPOINT_SUMMONER_BY_NAME;
const riotEndpointRankBySummonerPreProcess = process.env.RIOT_ENDPOINT_RANK_BY_SUMMONER;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE;
const collectionName = process.env.MONGODB_COLLECTION_SUMMONERS;

const router: Router = express.Router();

// Create a new MongoClient
const client = new MongoClient(mongoUri!);

// Define your routes
// Get all summoner names
router.get('/summoner-names', async (req: Request, res: Response) => {
  console.log("get /summoner-names")
  try {
    // Get the database and collection
    const db = client.db(dbName!);
    const collection = db.collection(collectionName!);
    await client.connect();

    // Fetch all summoner names from the collection
    const summonerDtos = await collection.distinct('summonerDto');

    // Close the connection
    client.close();

    res.send(summonerDtos);
  } catch (error) {
    // Close the connection
    client.close();

    console.error('Error occurred while fetching summonerDtos:', error);
    res.status(500).send('Error occurred while fetching summonerDtos.');
  }
});

// Get data specific to a summoner name
router.get('/summoner-names/:name', async (req: Request, res: Response) => {
  const summonerName = req.params.name; // Get the summoner name from the route parameter
  console.log("get /summoner-names/" + summonerName)
  const riotEndpointSummonerByName = riotEndpointSummonerByNamePreProcess?.replace("{summonerName}", summonerName);

  const db = client.db(dbName!);
  const collection = db.collection(collectionName!);

  // Look for summoner name in database
  try {
    console.log("Looking for " + summonerName + " in database.")
    // Get the database and collection
    await client.connect();

    // Check if summoner data exists in the database
    const existingSummoner = await collection.findOne({ 'summonerDto.name': { $regex: new RegExp(`^${summonerName}$`, 'i') } });

    // If exist, send data from database
    if (existingSummoner) {
      console.log("Found " + summonerName + " in database.")

      client.close();
      res.send(existingSummoner)
      return;
    }

    // does not exist in database, proceed to API request
    console.log("Did not find " + summonerName + " in database.")
    client.close();

  } catch (error) {
    console.error("Error getting data from database", error)
    client.close();
  }

  // Look for summoner name in API
  try {
    console.log("Looking for " + summonerName + " in API.")
    const response1 = await axios.get(`${riotEndpointSummonerByName}`, {
      headers: {
        'X-Riot-Token': riotApiKey
      }
    });
    const summonerData: SummonerDTO = response1.data
    const riotEndpointRankBySummoner = riotEndpointRankBySummonerPreProcess?.replace("{puuid}", summonerData.id);

    const response2 = await axios.get(`${riotEndpointRankBySummoner}`, {
      headers: {
        'X-Riot-Token': riotApiKey
      }
    });
    const leagueEntryData = response2.data;

    const sData: SummonerData = {
      //@ts-ignore
      _id: summonerData.puuid,
      timestamp: new Date(),
      summonerDto: summonerData,
      leagueEntryDto: leagueEntryData
    }

    try {
      // Insert new summoner data into the collection
      await client.connect();
      const confirmation = await collection.insertOne(sData);
      if(confirmation.acknowledged)
      {
        console.log('Summoner ' + summonerName + ' inserted successfully in database.');
      }
      else
      {
        console.error(summonerName + ' could not be inserted in database.');
      }
      client.close();
    } catch (error) {
      console.error('Error inserting ' + summonerName + ' in database.', error);
      client.close();
    }

    // Send data gathered from API
    res.send(sData)
    return;

  } catch (e: any) {
    // Failed to retrieve any data from both database and API
    const statusCode = e.response ? e.response.status : 500;
    console.error('Error ' + statusCode + ' occurred while fetching summoner data.');
    res.status(statusCode).send('Error ' + statusCode + ' occurred while fetching summoner data.');
    return;
  }
});

export default router;