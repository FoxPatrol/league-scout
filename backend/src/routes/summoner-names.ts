import { SummonerData, SummonerDTO } from '@interfaces/interfaces';
import { Request, Response } from 'express';
import axios from 'axios';
import config from '@config/config';
import { MongoDBConnector } from '@db/connector';
import PromiseRouter from 'express-promise-router';

const riotApiKey = config.RIOT_API_KEY;
const riotEndpointSummonerByNamePreProcess =
  config.RIOT_ENDPOINT_SUMMONER_BY_NAME;
const riotEndpointRankBySummonerPreProcess =
  config.RIOT_ENDPOINT_RANK_BY_SUMMONER;
const collectionName = config.MONGODB_COLLECTION_SUMMONERS;

const router = PromiseRouter();

// Define your routes
// Get all summoner names
router.get('/summoner-names', async (req: Request, res: Response) => {
  console.log('get /summoner-names');

  try {
    // Get the database and collection
    const db = MongoDBConnector.getInstance().getDb();
    const collection = db.collection(collectionName);

    // Fetch all summoner names from the collection
    const summonerDtos = await collection.distinct('summonerDto');

    // Close the connection
    //client.close();

    res.send(summonerDtos);
  } catch (error) {
    // Close the connection
    //client.close();

    console.error('Error occurred while fetching summonerDtos:', error);
    res.status(500).send('Error occurred while fetching summonerDtos.');
  }
});

// Get data specific to a summoner name
router.get('/summoner-names/:name', async (req: Request, res: Response) => {
  const summonerName = req.params.name; // Get the summoner name from the route parameter
  console.log('get /summoner-names/' + summonerName);
  const riotEndpointSummonerByName =
    riotEndpointSummonerByNamePreProcess.replace(
      '{summonerName}',
      summonerName,
    );

  const forceRefresh = req.headers['force-refresh'] === 'true'; // Check if "force-refresh" header exists and is true

  // Look for summoner name in database
  if (!forceRefresh) {
    try {
      console.log('Looking for ' + summonerName + ' in database.');

      const db = MongoDBConnector.getInstance().getDb();
      const collection = db.collection(collectionName);

      // Check if summoner data exists in the database
      const existingSummoner = await collection.findOne({
        'summonerDto.name': { $regex: new RegExp(`^${summonerName}$`, 'i') },
      });

      // If exist, send data from database
      if (existingSummoner) {
        console.log('Found ' + summonerName + ' in database.');

        //client.close();
        res.send(existingSummoner);
        return;
      }

      // does not exist in database, proceed to API request
      console.log('Did not find ' + summonerName + ' in database.');
      //client.close();
    } catch (error) {
      console.error('Error getting data from database', error);
      //client.close();
    }
  }

  // Look for summoner name in API
  try {
    console.log('Looking for ' + summonerName + ' in API.');
    const response1 = await axios.get(`${riotEndpointSummonerByName}`, {
      headers: {
        'X-Riot-Token': riotApiKey,
      },
    });
    const summonerData: SummonerDTO = response1.data;
    const riotEndpointRankBySummoner =
      riotEndpointRankBySummonerPreProcess.replace('{puuid}', summonerData.id);

    const response2 = await axios.get(`${riotEndpointRankBySummoner}`, {
      headers: {
        'X-Riot-Token': riotApiKey,
      },
    });
    const leagueEntryData = response2.data;

    const sData: SummonerData = {
      //@ts-ignore
      _id: summonerData.puuid,
      timestamp: new Date(),
      summonerDto: summonerData,
      leagueEntryDto: leagueEntryData,
    };

    const query = { _id: summonerData.puuid };
    const update = {
      $set: {
        timestamp: new Date(),
        summonerDto: summonerData,
        leagueEntryDto: leagueEntryData,
      },
    };

    try {
      const db = MongoDBConnector.getInstance().getDb();
      const collection = db.collection(collectionName);

      // Insert new summoner data into the collection
      //@ts-ignore
      const confirmation = await collection.updateOne(query, update, {
        upsert: true,
      });
      if (confirmation.acknowledged) {
        console.log(
          'Summoner ' + summonerName + ' inserted successfully in database.',
        );
      } else {
        console.error(summonerName + ' could not be inserted in database.');
      }
      //client.close();
    } catch (error) {
      console.error('Error inserting ' + summonerName + ' in database.', error);
      //client.close();
    }

    // Send data gathered from API
    res.send(sData);
    return;
  } catch (e: any) {
    // Failed to retrieve any data from both database and API
    const statusCode = e.response ? e.response.status : 500;
    console.error(
      'Error ' + statusCode + ' occurred while fetching summoner data.',
    );
    res
      .status(statusCode)
      .send('Error ' + statusCode + ' occurred while fetching summoner data.');
    return;
  }
});

export default router;
