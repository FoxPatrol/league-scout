import { SummonersMatchesRelationsData } from '../interfaces/interfaces';
import { Request, Response } from 'express';
import axios from 'axios';
import config from '@config/config';
import { MongoDBConnector } from '@db/connector';
import PromiseRouter from 'express-promise-router';

const riotApiKey = config.RIOT_API_KEY;
const riotEndpointMatchesByPuuidPreProcess =
  config.RIOT_ENDPOINT_MATCHES_BY_PUUID;
const collectionSummonersMatchesRelations =
  config.MONGODB_COLLECTION_SUMMONERS_MATCHES_RELATIONS;

const router = PromiseRouter();

// Define your routes

// Get matches data specific to a puuid
router.get('/matches/by-puuid/:puuid', async (req: Request, res: Response) => {
  const puuid = req.params.puuid; // Get the puuid from the route parameter
  console.log('get /matches/by-puuid/' + puuid);
  const riotEndpointMatchesByPuuid =
    riotEndpointMatchesByPuuidPreProcess.replace('{puuid}', puuid);

  // Look for summoner puuid in the database
  try {
    const db = MongoDBConnector.getInstance().getDb();
    const collection = db.collection(collectionSummonersMatchesRelations!);

    //@ts-ignore
    const existingMatchesData = await collection.findOne({ _id: puuid });

    if (existingMatchesData) {
      console.log('Found ' + puuid + ' in the database.');
      res.send(existingMatchesData);
    } else {
      console.log('Did not find ' + puuid + ' in the database.');
      //res.status(500).send('Error occurred while fetching matches data.');
    }
  } catch (error) {
    console.error('Error accessing the database', error);
    //res.status(500).send('Error occurred while fetching matches data.');
  }

  // Look for matches by puuid in the API
  try {
    console.log('Looking for matches by puuid ' + puuid + ' in the API.');
    const response = await axios.get(`${riotEndpointMatchesByPuuid}`, {
      headers: {
        'X-Riot-Token': riotApiKey,
      },
    });

    const matchesData: SummonersMatchesRelationsData = {
      //@ts-ignore
      _id: puuid,
      timestamp: new Date(),
      matches: response.data,
    };

    // Insert new data into the collection
    try {
      // Check if an object with the same _id exists in the collection
      const db = MongoDBConnector.getInstance().getDb();
      const collection = db.collection(collectionSummonersMatchesRelations!);

      //@ts-ignore
      const existingData = await collection.findOne({ _id: puuid });

      if (existingData) {
        // Merge the new matches with the existing matches array and remove duplicates
        const updatedMatches = [
          ...matchesData.matches,
          ...existingData.matches,
        ];
        const uniqueMatches = [...new Set(updatedMatches)];

        // Update the existing document with the unique matches data
        const updateConfirmation = await collection.updateOne(
          //@ts-ignore
          { _id: puuid },
          { $set: { matches: uniqueMatches } },
        );

        if (updateConfirmation.acknowledged) {
          console.log(
            'Matches data related to ' +
              puuid +
              ' updated successfully in the database.',
          );
        } else {
          console.error(
            'Failed to update matches data related to ' +
              puuid +
              ' in the database.',
          );
        }
      } else {
        // Insert new data into the collection
        const insertConfirmation = await collection.insertOne(matchesData);

        if (insertConfirmation.acknowledged) {
          console.log(
            'Matches data related to ' +
              puuid +
              ' inserted successfully in the database.',
          );
        } else {
          console.error(
            'Failed to insert matches data related to ' +
              puuid +
              ' in the database.',
          );
        }
      }
    } catch (err) {
      console.error(err);
    }

    // Send data gathered from the API
    res.send(matchesData);
  } catch (error) {
    //@ts-ignore
    console.error(
      'Could not get matches data from API for ' + puuid + '. Using db.',
      //@ts-ignore
      error.code,
    );
  }
});

export default router;
