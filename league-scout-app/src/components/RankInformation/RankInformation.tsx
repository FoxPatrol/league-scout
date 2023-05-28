import { LeagueEntryDTO } from "../../../../backend/src/interface/interfaces";
import RankIcon from "../RankIcon/RankIcon";

export default function RankInformation({ queueName, queueType }: { queueName: string, queueType: LeagueEntryDTO }) {
  return (
    <div className='flex flex-row border-2 border-gray-400 rounded-3xl justify-center'>
        <div className='flex flex-col p-2'>
          <p className='p-2 text-3xl'>{queueName}</p>
          <RankIcon icon={queueType?.tier}/>
        </div>

        <div className='flex flex-col p-2'>
          <div className='p-2 h-12'></div>
          {!queueType ? <p className='p-2 text-4xl text-center my-auto'>Unranked</p> :

          <div className='flex flex-row my-auto'>
            <div className='flex flex-col my-auto'>
              <p className='p-2 pb-0 text-3xl'>{queueType.tier} {queueType.rank}</p>
              <p className='p-2 pt-0 text-xl'>{queueType.leaguePoints} Lp</p>
            </div>

            <div className='flex flex-col my-auto'>
              <p className='p-2 pb-0 text-3xl'>&nbsp;{Math.round(queueType.wins / (queueType.wins + queueType.losses) * 100)}%</p>

              <div className='flex flex-row p-2 pt-0 mx-auto'>
                <p className='text-xl text-green-700'>{queueType.wins}</p>
                <p className='text-xl opacity-50 px-1'>|</p>
                <p className='text-xl text-red-700'>{queueType.losses}</p>
              </div>
            </div>
          </div>
          }
        </div>
      </div>
  )
}
