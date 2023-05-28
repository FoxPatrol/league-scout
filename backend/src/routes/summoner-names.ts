import { LeagueData, SummonerDTO } from '../interface/interfaces';
import express, { Request, Response, Router } from 'express';
import axios from 'axios';

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config(); // Load environment variables from .env file
const riotApiKey = process.env.RIOT_API_KEY;
const riotEndpointSummonerByName = process.env.RIOT_ENDPOINT_SUMMONER_BY_NAME;
const riotEndpointRankBySummoner = process.env.RIOT_ENDPOINT_RANK_BY_SUMMONER;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE;
const collectionName = process.env.MONGODB_COLLECTION;

const router: Router = express.Router();

// Create a new MongoClient
const client = new MongoClient(mongoUri!);

// Define your routes
// Get all summoner names
router.get('/summoner-names', async (req: Request, res: Response) => {
  try {
    // Get the database and collection
    const db = client.db(dbName!);
    const collection = db.collection(collectionName!);
    await client.connect();

    // Fetch all summoner names from the collection
    const summonerNames = await collection.distinct('summonerDto.name');

    // Close the connection
    client.close();

    res.send(summonerNames);
  } catch (error) {
    // Close the connection
    client.close();

    console.error('Error occurred while fetching summoner names:', error);
    res.status(500).send('Error occurred while fetching summoner names.');
  }
});

// Get data specific to a summoner name
router.get('/summoner-names/:name', async (req: Request, res: Response) => {
  const summonerName = req.params.name; // Get the summoner name from the route parameter
  console.log("summonerName:", summonerName)

  try {
    // Get the database and collection
    const db = client.db(dbName!);
    const collection = db.collection(collectionName!);
    await client.connect();

    // Check if summoner data exists in the database
    const existingSummoner = await collection.findOne({ 'summonerDto.name': summonerName });

    // If exist, send data from database
    if (existingSummoner) {
      console.log("Found " + summonerName + " in database.")

      // Close the connection
      client.close();

      res.send(existingSummoner)
      return;
    }

    console.log("Not found " + summonerName + " in database. Fetching from API.")
    const response1 = await axios.get(`${riotEndpointSummonerByName}${summonerName}`, {
      headers: {
        'X-Riot-Token': riotApiKey
      }
    });
    const summonerData: SummonerDTO = response1.data

    const response2 = await axios.get(`${riotEndpointRankBySummoner}${summonerData.id}`, {
      headers: {
        'X-Riot-Token': riotApiKey
      }
    });
    const leagueEntryData = response2.data;

    const leagueData: LeagueData = {
      //@ts-ignore
      _id: summonerData.id,
      timestamp: new Date(),
      summonerDto: summonerData,
      leagueEntryDto: leagueEntryData
    }

    // Insert new summoner data into the collection
    const confirmation = await collection.insertOne(leagueData);
    if(confirmation.acknowledged)
    {
      console.log('Summoner ' + summonerName + ' inserted successfully in database.');
    }
    else
    {
      console.error('Error inserting ' + summonerName + ' in database.');
    }

    // Close the connection
    client.close();

    res.send(leagueData)
  } catch (e: any) {
    // Close the connection
    client.close();

    const statusCode = e.response ? e.response.status : 500;
    console.error('Error ' + statusCode + ' occurred while fetching summoner data.');
    res.status(statusCode).send('Error ' + statusCode + ' occurred while fetching summoner data.');
  }
});

export default router;