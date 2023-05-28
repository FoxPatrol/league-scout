import { useEffect, useState } from 'react'
import { LeagueData } from '../../../../backend/src/interface/interfaces';
import SummonerIcon from '../SummonerIcon/SummonerIcon';
import RankInformation from '../RankInformation/RankInformation';
import axios from 'axios';

const baseUrl = 'http://localhost:3000/';
const getSummonerNameUrl = baseUrl + 'summoner-names/';

export default function LeagueDetails() {
  const [data, setData] = useState<LeagueData>();
  const [solo, setSolo] = useState<any>();
  const [flex, setFlex] = useState<any>();

  useEffect(() => {
    const location = window.location;
    const searchParams = new URLSearchParams(location.search);
    const summoner = searchParams.get("summoner");

    if(!summoner)
    {
      console.error("Summoner name empty", summoner)
      return
    }

    getData(summoner).then(d => {
      setData(d);

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

  async function getData(summoner: string): Promise<LeagueData | undefined> {
    try {
      const response = await axios.get(`${getSummonerNameUrl}${summoner}`);
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error:', error);
      return undefined;
    }
    return undefined;
  }

  return (
    <div className='flex flex-col'>
      <div className='flex flex-row justify-center p-2 sm:gap-6'>

        {
          // Summoner icon and level column
        }
        <div className='content-center min-w-fit p-2'>
          <SummonerIcon icon={data?.summonerDto.profileIconId}/>
          <div className='flex flex-col p-1'>
            <div className='flex-1'></div>
            <div className='flex-1 text-xl'>{data?.summonerDto.summonerLevel}</div>
            <div className='flex-1'></div>
          </div>
        </div>

        {
          // Summoner name and spacing
        }
        <div className='flex flex-col p-2'>
          <div className='flex h-full'>
            <div className='m-auto'>
              <div className='text-4xl sm:text-6xl'>{data?.summonerDto.name}</div>
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
  )
}
