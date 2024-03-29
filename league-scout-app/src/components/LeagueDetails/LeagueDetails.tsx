import { useEffect, useState } from 'react';
import { MatchDTO, SummonerData, SummonersMatchesRelationsData } from '../../../../backend/src/interface/interfaces';
import SummonerIcon, { SizeType } from '../SummonerIcon/SummonerIcon';
import RankInformation from '../RankInformation/RankInformation';
import axios, { AxiosRequestConfig } from 'axios';
import MatchItem from '../MatchItem/MatchItem';
import { useNavigate } from 'react-router-dom';

const baseUrl = 'http://localhost:3000/';
const getSummonerNameUrl = baseUrl + 'summoner-names/';
const getMatchesByPuuidUrl = baseUrl + 'matches/by-puuid/';
const getMatchUrl = baseUrl + 'matches/';

export default function LeagueDetails() {
  const [summonerData, setSummonerData] = useState<SummonerData>();
  const [solo, setSolo] = useState<any>();
  const [flex, setFlex] = useState<any>();
  const [matchesData, setMatchesData] = useState<any[]>([]);
  const [summonerDataLastUpdateTimeDiffInMinutes, setSummonerDataLastUpdateTimeDiffInMinutes] = useState<number>();
  const navigate = useNavigate();

  useEffect(() => {
    const location = window.location;
    const searchParams = new URLSearchParams(location.search);
    const summoner = searchParams.get('summoner');

    if (!summoner) {
      console.error('Summoner name empty', summoner);
      return;
    }

    if (summonerData) {
      return;
    }

    getSummonerData(summoner);
  }, []);

  useEffect(() => {
    if (!summonerData) {
      return;
    }

    for (let dd of summonerData.leagueEntryDto) {
      if (dd.queueType.includes('FLEX')) {
        setFlex(dd);
      } else if (dd.queueType.includes('SOLO')) {
        setSolo(dd);
      } else {
        console.error('Couldnt match this data to league type', dd);
      }
    }

    if (summonerData.timestamp) {
      const gameFinishDate = new Date(summonerData.timestamp);
      const now = new Date();
      const timeDiffInMilliseconds = now.getTime() - gameFinishDate.getTime();
      setSummonerDataLastUpdateTimeDiffInMinutes(timeDiffInMilliseconds / 1000 / 60);
    }

    getMatchesByPuuidData(summonerData.summonerDto.puuid).then((matches) => {
      if (!matches || matches.matches.length < 1) {
        console.error('No matches', matches);
        return;
      }

      const matchIds = matches.matches;
      if (!matchIds) {
        console.error('No matchIds', matchIds);
        return;
      }

      getMatchData(matchIds[0]).then((matchData: MatchDTO) => {
        setMatchesData([matchData]);
      });
      //Promise.all(matchIds.map((matchId) => getMatchData(matchId)))
      //  .then((matchDataArray) => {
      //    setMatchesData(matchDataArray);
      //  })
      //  .catch((error) => {
      //    console.error('Error:', error);
      //  });
    });
  }, [summonerData]);

  async function getSummonerData(summoner: string, forceRefresh?: boolean): Promise<void> {
    try {
      const headers: AxiosRequestConfig['headers'] = {};
      if (forceRefresh) {
        headers['force-refresh'] = 'true';
      }

      const config: AxiosRequestConfig = {
        headers,
      };

      const response = await axios.get(`${getSummonerNameUrl}${summoner}`, config);
      const data = response.data;
      setSummonerData(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function getMatchesByPuuidData(puuid: string): Promise<SummonersMatchesRelationsData | undefined> {
    try {
      const response = await axios.get(`${getMatchesByPuuidUrl}${puuid}`);
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error:', error);
      return undefined;
    }
  }

  async function getMatchData(matchId: string): Promise<MatchDTO | undefined> {
    try {
      const response = await axios.get(`${getMatchUrl}${matchId}`);
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error:', error);
      return undefined;
    }
  }

  function handleTimeline(matchId: string): void {
    navigate(`/league-details/timeline?matchId=${matchId}`);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-2 justify-center">
      <div className="flex flex-col">
        <div className="flex flex-row justify-center p-2 sm:gap-6">
          {
            // Summoner icon and level column
          }
          <div className="content-center min-w-fit p-2">
            <SummonerIcon icon={summonerData?.summonerDto.profileIconId} size={SizeType.Big} />
            <div className="flex flex-col p-1">
              <div className="flex-1"></div>
              <div className="flex-1 text-xl">{summonerData?.summonerDto.summonerLevel}</div>
              <div className="flex-1"></div>
            </div>
          </div>

          {
            // Summoner name and spacing
          }
          <div className="flex flex-col p-2">
            <div className="flex mt-2 me-auto">
              <div className="text-4xl sm:text-6xl">{summonerData?.summonerDto.name}</div>
            </div>

            <span className="flex items-center gap-2 pt-1 ps-1">
              {summonerDataLastUpdateTimeDiffInMinutes ? (
                // Text displaying last update date for summoner data
                <p
                  className="mb-auto text-left text-gray-500"
                  title={summonerData?.timestamp ? new Date(summonerData.timestamp).toLocaleString() : ''}
                >
                  Updated{' '}
                  {summonerDataLastUpdateTimeDiffInMinutes > 60 * 24 * 2
                    ? Math.floor(summonerDataLastUpdateTimeDiffInMinutes / 60 / 24) + ' days ago'
                    : summonerDataLastUpdateTimeDiffInMinutes > 60 * 24
                    ? 'Yesterday'
                    : Math.floor(summonerDataLastUpdateTimeDiffInMinutes / 60) +
                      'h' +
                      String(Math.round(summonerDataLastUpdateTimeDiffInMinutes % 60)).padStart(2, '0') +
                      'm ago'}
                </p>
              ) : (
                'No last update date'
              )}

              <button
                className="py-0 flex items-end bg-orange-100"
                onClick={() => {
                  summonerData ? getSummonerData(summonerData.summonerDto.name, true) : console.error('No summoner data to refresh');
                }}
              >
                Refresh
              </button>
            </span>
          </div>
        </div>

        <div className="flex flex-col p-2 gap-3">
          <RankInformation queueName="Solo" queueType={solo}></RankInformation>
          <RankInformation queueName="Flex" queueType={flex}></RankInformation>
        </div>
      </div>

      {
        //  Match item + timeline button
      }
      <div className="flex flex-col gap-1">
        {matchesData && summonerData
          ? matchesData.map((matchData, index) => (
              <div className="flex flex-col">
                <MatchItem key={index} matchInfo={matchData.info} mainSummonerName={summonerData.summonerDto.name} />
                <button className="bg-gray-100 border-gray-300 p-0 rounded-t-none" onClick={() => handleTimeline(matchData.metadata.matchId)}>
                  Timeline
                </button>
              </div>
            ))
          : 'nn'}
      </div>
    </div>
  );
}
