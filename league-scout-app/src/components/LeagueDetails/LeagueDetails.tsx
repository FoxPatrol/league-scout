import { useEffect, useState } from 'react'
import { MatchDTO, SummonerData, SummonersMatchesRelationsData } from '../../../../backend/src/interface/interfaces';
import SummonerIcon, { SizeType } from '../SummonerIcon/SummonerIcon';
import RankInformation from '../RankInformation/RankInformation';
import axios from 'axios';
import MatchItem from '../MatchItem/MatchItem';

const baseUrl = 'http://localhost:3000/';
const getSummonerNameUrl = baseUrl + 'summoner-names/';
const getMatchesByPuuidUrl = baseUrl + 'matches/by-puuid/';
const getMatchUrl = baseUrl + 'matches/';

export default function LeagueDetails() {
  const [summonerData, setSummonerData] = useState<SummonerData>();
  const [solo, setSolo] = useState<any>();
  const [flex, setFlex] = useState<any>();
  const [matchesInfo, setMatchesInfo] = useState<any[]>([]);

  useEffect(() => {
    const location = window.location;
    const searchParams = new URLSearchParams(location.search);
    const summoner = searchParams.get("summoner");

    if(!summoner)
    {
      console.error("Summoner name empty", summoner)
      return
    }

    if(summonerData)
    {
      return;
    }

    getSummonerData(summoner).then(d => {
      setSummonerData(d);

      if(!d)
      {
        console.log("no data", d)
        return;
      }

      for(let dd of d.leagueEntryDto)
      {
        if(dd.queueType.includes("FLEX"))
        {
          setFlex(dd)
        }
        else if(dd.queueType.includes("SOLO"))
        {
          setSolo(dd)
        }
        else
        {
          console.error("Couldnt match this data to league type", dd)
        }
      }
    })
  }, [])

  useEffect(() => {
    if(!summonerData || (matchesInfo && matchesInfo.length > 0))
    {
      return;
    }

    getMatchesByPuuidData(summonerData.summonerDto.puuid).then(matches => {
      if(!matches || matches.matches.length < 1)
      {
        console.error("No matches", matches)
        return;
      }

      const matchIds = matches.matches;
      if(!matchIds)
      {
        console.error("No matchIds", matchIds)
        return;
      }

      Promise.all(matchIds.map(matchId => getMatchData(matchId))).then(matchDataArray => {
        const updatedMatchesInfo = matchDataArray.map(matchData => matchData?.info);
        setMatchesInfo(updatedMatchesInfo);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    })

  }, [summonerData])

  async function getSummonerData(summoner: string): Promise<SummonerData | undefined> {
    try {
      const response = await axios.get(`${getSummonerNameUrl}${summoner}`);
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error:', error);
      return undefined;
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

  return (
    <div className='flex flex-col lg:flex-row gap-2 justify-center'>
      <div className='flex flex-col'>
        <div className='flex flex-row justify-center p-2 sm:gap-6'>

          {
            // Summoner icon and level column
          }
          <div className='content-center min-w-fit p-2'>
            <SummonerIcon icon={summonerData?.summonerDto.profileIconId} size={SizeType.Big}/>
            <div className='flex flex-col p-1'>
              <div className='flex-1'></div>
              <div className='flex-1 text-xl'>{summonerData?.summonerDto.summonerLevel}</div>
              <div className='flex-1'></div>
            </div>
          </div>

          {
            // Summoner name and spacing
          }
          <div className='flex flex-col p-2'>
            <div className='flex h-full'>
              <div className='m-auto'>
                <div className='text-4xl sm:text-6xl'>{summonerData?.summonerDto.name}</div>
              </div>
            </div>
            <div className='p-2 h-9 mt-auto'></div>
          </div>
        </div>

        <div className='flex flex-col p-2 gap-3'>
          <RankInformation queueName='Solo' queueType={solo}></RankInformation>
          <RankInformation queueName='Flex' queueType={flex}></RankInformation>
        </div>

      </div>

      <div className='flex flex-col'>
        {matchesInfo && summonerData ? matchesInfo.map((matchInfo, index) => (
          <MatchItem key={index} matchInfo={matchInfo} mainSummonerName={summonerData.summonerDto.name}/>
        )) : "nn"}
      </div>

    </div>
  )
}
