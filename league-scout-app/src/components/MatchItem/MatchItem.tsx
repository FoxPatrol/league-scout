import ChampionIcon, { SizeType } from '../ChampionIcon/ChampionIcon';
import ItemIcon from '../ItemIcon/ItemIcon';
import SummonerSpellIcon from '../SummonerSpellIcon/SummonerSpellIcon';

export default function MatchItem({ matchInfo, mainSummonerName } : {matchInfo: any, mainSummonerName: string}) {
  const mainPlayer = matchInfo.participants.find((player: any) => player.summonerName === mainSummonerName)
  const gameFinishDate = new Date(matchInfo.gameEndTimestamp);
  const now = new Date();
  const timeDiffInMilliseconds = now.getTime() - gameFinishDate.getTime();
  const timeDiffInMinutes = timeDiffInMilliseconds / 1000 / 60;

  return (
    <div className="border border-gray-300 flex items-center">

      {/* Match info like when it was played and victory/defeat */}
      <div className='p-1 w-1/6 min-w-fit'>
        <p className='text-lg'>{Math.floor(matchInfo.gameDuration / 60)}:{String(Math.round(matchInfo.gameDuration % 60)).padStart(2, '0')}</p>
        <p className={"font-bold text-3xl" + (mainPlayer.win ? " text-green-700" : " text-red-700")}>{mainPlayer.win ? "Victory" : "Defeat"}</p>
        <p className='text-sm text-gray-400'>{timeDiffInMinutes > 60*24*2 ? Math.floor(timeDiffInMinutes/60/24) + " days ago" :
            timeDiffInMinutes > 60*24 ? "Yesterday":
            Math.floor(timeDiffInMinutes / 60) + "h" + String(Math.round(timeDiffInMinutes % 60)).padStart(2, '0') + "m ago"}</p>
      </div>

      {/* Summoner info like champion played, kda, items, runes, summoner spells */}
      <div className='p-1 w-1/6 min-w-fit'>

        <div className='flex items-center justify-center'>
          <div className='flex items-center pb-2 pe-2'>
            {/* Champion played */}
            <ChampionIcon champion={mainPlayer.championName} size={SizeType.Medium} />

            <div>
              {/* Summoner spells */}
              <SummonerSpellIcon summonerSpell={mainPlayer.summoner1Id} size={SizeType.Small}/>
              <SummonerSpellIcon summonerSpell={mainPlayer.summoner2Id} size={SizeType.Small}/>
            </div>

            <div>
              {/* Runes */}
              <SummonerSpellIcon summonerSpell={0} size={SizeType.Small}/>
              <SummonerSpellIcon summonerSpell={0} size={SizeType.Small}/>
            </div>
          </div>

          <div className='flex'>
            {/* KDA */}
            <div className='text-xl'>
            <span className='font-bold'>{mainPlayer.kills}</span>
            <span> / </span>
            <span className='font-bold'>{mainPlayer.deaths}</span>
            <span> / </span>
            <span className='font-bold'>{mainPlayer.assists}</span>
            </div>
          </div>
        </div>

        {/* Item list */}
        <div className='flex justify-center'>
          <ItemIcon item={mainPlayer.item0} size={SizeType.Small} />
          <ItemIcon item={mainPlayer.item1} size={SizeType.Small} />
          <ItemIcon item={mainPlayer.item2} size={SizeType.Small} />
          <ItemIcon item={mainPlayer.item3} size={SizeType.Small} />
          <ItemIcon item={mainPlayer.item4} size={SizeType.Small} />
          <ItemIcon item={mainPlayer.item5} size={SizeType.Small} />
          <ItemIcon item={mainPlayer.item6} size={SizeType.Small} />
        </div>
      </div>


      {/* Team info like composition, names of teammates */}
      <div className="flex w-2/3 min-w-fit">
        <div className="w-1/2 pr-2">
          {matchInfo.participants.slice(0, 5).map((player: any, index: number) => (
            <div key={index} className="flex items-center">
              <ChampionIcon champion={player.championName} size={SizeType.Small} />
              <span className="ml-2 overflow-hidden overflow-ellipsis">{player.summonerName}</span>
            </div>
          ))}
        </div>
        <div className="w-1/2 pl-2 border-l">
          {matchInfo.participants.slice(5, 10).map((player: any, index: number) => (
            <div key={index} className="flex items-center justify-end">
              <span className="mr-2 overflow-hidden overflow-ellipsis">{player.summonerName}</span>
              <ChampionIcon champion={player.championName} size={SizeType.Small} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
