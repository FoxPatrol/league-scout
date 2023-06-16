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

// Create a new MongoClient instance
const client = new MongoClient(mongoUri!);

// Define your routes

// Get matches data specific to a puuid
router.get('/matches/by-puuid/:puuid', async (req: Request, res: Response) => {
  const puuid = req.params.puuid; // Get the puuid from the route parameter
  console.log("get /matches/by-puuid/" + puuid)
  const riotEndpointMatchesByPuuid = riotEndpointMatchesByPuuidPreProcess?.replace("{puuid}", puuid);

  try {
    // Connect to the MongoDB database
    await client.connect();

    const db = client.db(dbName!);
    const collection = db.collection(collectionSummonersMatchesRelations!);

    // Look for matches by puuid in the API
    try {
      console.log("Looking for matches by puuid " + puuid + " in the API.");
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
      };

      // Insert new data into the collection
      // Check if an object with the same _id exists in the collection
      //@ts-ignore
      const existingData = await collection.findOne({ _id: puuid });

      if (existingData) {
        // Merge the new matches with the existing matches array and remove duplicates
        const updatedMatches = [...matchesData.matches, ...existingData.matches];
        const uniqueMatches = [...new Set(updatedMatches)];

        // Update the existing document with the unique matches data
        const updateConfirmation = await collection.updateOne(
          //@ts-ignore
          { _id: puuid },
          { $set: { matches: uniqueMatches } }
        );

        if (updateConfirmation.acknowledged) {
          console.log('Matches data related to ' + puuid + ' updated successfully in the database.');
        } else {
          console.error('Failed to update matches data related to ' + puuid + ' in the database.');
        }
      } else {
        // Insert new data into the collection
        const insertConfirmation = await collection.insertOne(matchesData);

        if (insertConfirmation.acknowledged) {
          console.log('Matches data related to ' + puuid + ' inserted successfully in the database.');
        } else {
          console.error('Failed to insert matches data related to ' + puuid + ' in the database.');
        }
      }

      // Send data gathered from the API
      res.send(matchesData);
    } catch (error) {
      //@ts-ignore
      console.error('Could not get matches data from API for ' + puuid + '. Using db.', error.code);

      // Look for summoner puuid in the database
      //@ts-ignore
      const existingMatchesData = await collection.findOne({ _id: puuid });

      if (existingMatchesData) {
        console.log("Found " + puuid + " in the database.");
        res.send(existingMatchesData);
      } else {
        console.log("Did not find " + puuid + " in the database.");
        res.status(500).send('Error occurred while fetching matches data.');
      }
    }
  } catch (error) {
    console.error("Error accessing the database", error);
    res.status(500).send('Error occurred while fetching matches data.');
  } finally {
    // Close the MongoDB connection
    //client.close();
  }
});

export default router;
