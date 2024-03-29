import ChampionIcon, { SizeType } from '../ChampionIcon/ChampionIcon';
import ItemIcon from '../ItemIcon/ItemIcon';
import RuneIcon from '../RuneIcon/RuneIcon';
import SummonerSpellIcon from '../SummonerSpellIcon/SummonerSpellIcon';

export default function MatchItem({ matchInfo, mainSummonerName }: { matchInfo: any; mainSummonerName: string }) {
  const mainPlayer = matchInfo.participants.find((player: any) => player.summonerName === mainSummonerName);
  const gameFinishDate = new Date(matchInfo.gameEndTimestamp);
  const now = new Date();
  const timeDiffInMilliseconds = now.getTime() - gameFinishDate.getTime();
  const timeDiffInMinutes = timeDiffInMilliseconds / 1000 / 60;
  const gameModeMap: { [key: number]: string } = { 400: 'Normal', 420: 'Solo/Duo', 440: 'Flex', 450: 'ARAM', 700: 'Clash' };

  return (
    <div className={'border border-gray-300 flex items-center gap-1' + (mainPlayer.win ? ' bg-green-100' : ' bg-red-100')}>
      {/* Match info like when it was played and victory/defeat */}
      <div className="p-1 w-1/6 min-w-[120px]">
        <p className="text-lg">
          {Math.floor(matchInfo.gameDuration / 60)}:{String(Math.round(matchInfo.gameDuration % 60)).padStart(2, '0')}
        </p>
        <p className={'font-bold text-3xl' + (mainPlayer.win ? ' text-green-700' : ' text-red-700')}>{mainPlayer.win ? 'Victory' : 'Defeat'}</p>
        <p>{gameModeMap[matchInfo.queueId] ?? 'Unknown'}</p>
        <p className="text-sm text-gray-400" title={gameFinishDate.toLocaleString()}>
          {timeDiffInMinutes > 60 * 24 * 2
            ? Math.floor(timeDiffInMinutes / 60 / 24) + ' days ago'
            : timeDiffInMinutes > 60 * 24
            ? 'Yesterday'
            : Math.floor(timeDiffInMinutes / 60) + 'h' + String(Math.floor(timeDiffInMinutes % 60)).padStart(2, '0') + 'm ago'}
        </p>
      </div>

      {/* Summoner info like champion played, kda, items, runes, summoner spells */}
      <div className="p-1 w-72">
        <div className="flex items-center justify-center gap-2 pb-2">
          <div className="flex items-center justify-center gap-1">
            {/* Champion played */}
            <ChampionIcon champion={mainPlayer.championName} size={SizeType.Medium} />

            <div>
              {/* Summoner spells */}
              <SummonerSpellIcon summonerSpell={mainPlayer.summoner1Id} size={SizeType.Small} />
              <SummonerSpellIcon summonerSpell={mainPlayer.summoner2Id} size={SizeType.Small} />
            </div>

            <div>
              {/* Runes */}
              <RuneIcon rune={mainPlayer.perks.styles[0]} size={SizeType.Small} />
              <RuneIcon rune={mainPlayer.perks.styles[1]} size={SizeType.Small} />
            </div>
          </div>

          <div className="flex w-20 items-center justify-center">
            {/* KDA */}
            <div className="text-xl">
              <span className="font-bold text-green-700">{mainPlayer.kills}</span>
              <span>/</span>
              <span className="font-bold text-red-700">{mainPlayer.deaths}</span>
              <span>/</span>
              <span className="font-bold text-orange-600">{mainPlayer.assists}</span>
            </div>
          </div>
        </div>

        {/* Item list */}
        <div className="flex justify-center">
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
      <div className="p-1 flex w-2/3">
        <div className="w-1/2 pr-2 min-w-[120px]">
          {matchInfo.participants.slice(0, 5).map((player: any, index: number) => (
            <div key={index} className="flex items-center">
              <ChampionIcon champion={player.championName} size={SizeType.Small} />
              <a
                className="ml-2 overflow-hidden overflow-ellipsis whitespace-nowrap text-black font-normal hover:underline"
                href={`/league-details?summoner=${player.summonerName}`}
              >
                {player.summonerName}
              </a>
            </div>
          ))}
        </div>
        <div className="w-1/2 pl-2 border-l min-w-[120px]">
          {matchInfo.participants.slice(5, 10).map((player: any, index: number) => (
            <div key={index} className="flex items-center justify-end">
              <a
                className="mr-2 overflow-hidden overflow-ellipsis whitespace-nowrap text-black font-normal hover:underline"
                href={`/league-details?summoner=${player.summonerName}`}
              >
                {player.summonerName}
              </a>
              <ChampionIcon champion={player.championName} size={SizeType.Small} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
