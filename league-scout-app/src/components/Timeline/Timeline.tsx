import './Timeline.css'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import backgroundImage from '../../assets/map/map11.png';
import ChampionIcon, { SizeType } from '../ChampionIcon/ChampionIcon';

const baseUrl = 'http://localhost:3000/';
let getMatchTimelineUrl = baseUrl + 'matches/{matchId}/timeline';
const getMatchUrl = baseUrl + 'matches/';

export default function Timeline() {
  const [matchTimeline, setMatchTimeline] = useState<any>();
  const [championOfParticipant, setChampionOfParticipant] = useState<Map<string, string>>();
  const [mapDimensions, setMapDimensions] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [frame, setFrame] = useState(0);

  const championIconDimensions = {width: 32, height: 32 };
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const location = window.location;
    const searchParams = new URLSearchParams(location.search);
    const matchId = searchParams.get("matchId");

    if(!matchId)
    {
      console.error("Match id empty", matchId)
      return
    }

    getMatchTimelineData(matchId);
    getMatchData(matchId);
    return;
  }, [])

  useEffect(() => {
    const mapElement = mapRef.current;

    const updateMapSizeAndPosition = () => {
      if (mapElement) {
        const { top, left, width, height } = mapElement.getBoundingClientRect();
        setMapDimensions({ top, left, width, height });
        //console.log({ top, left, width, height })
      }
    };

    window.addEventListener('resize', updateMapSizeAndPosition);
    updateMapSizeAndPosition(); // Initial size and position calculation

    return () => {
      window.removeEventListener('resize', updateMapSizeAndPosition);
    };
  }, []);

  function handleRangeChange(event: any): any {
    setFrame(event.target.value);
  };

  async function getMatchTimelineData(matchId: string): Promise<void> {
    const url = getMatchTimelineUrl.replace("{matchId}", matchId);

    try {
    const response = await axios.get(url);
      const data = response.data;
      setMatchTimeline(data);
      //console.log("Timeline data", data);
      //Object.entries(data.info.frames[0].participantFrames).forEach((a:any) => {console.log(a)})
      /*Object.entries(data.info.frames[frame].participantFrames).forEach((participant: any, position: number) => {
        console.log(participant[1])
        console.warn(position)
      })*/

    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function getMatchData(matchId: string): Promise<void> {
    try {
      const response = await axios.get(`${getMatchUrl}${matchId}`);
      const matchData = response.data;
      let championData = new Map<string, string>();
      matchData.info.participants.forEach((participaint: any, idx: number) => {
        championData.set((idx+1).toString(), participaint.championName);
      });
      setChampionOfParticipant(championData);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const styles = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100%',
  };

  return (
    <div className='flex justify-center'>

        <div className='h-screen aspect-square'>
        <div id='map' ref={mapRef} style={styles}></div>

        {matchTimeline && Object.entries(matchTimeline.info.frames[frame].participantFrames).map(([participantPosition, participant]: [string, any]) => (
          <div className='absolute' key={participantPosition} style={{top: mapDimensions.top - championIconDimensions.height/2 + mapDimensions.height*(1 - participant.position.y * 1/15000), left: mapDimensions.left - championIconDimensions.width/2 + participant.position.x * mapDimensions.width/15000}}>
            <ChampionIcon champion={championOfParticipant?.get(participantPosition)} size={SizeType.Small} dead={false}/>
          </div>
        ))}

        {matchTimeline && Object.entries(matchTimeline.info.frames[frame].events).map(([eventNumber, event]: [string, any]) => (
          event.victimId && <div className='absolute' key={eventNumber} style={{top: mapDimensions.top - championIconDimensions.height/2 + mapDimensions.height*(1 - event.position.y * 1/15000), left: mapDimensions.left - championIconDimensions.width/2 + event.position.x * mapDimensions.width/15000}}>
            <ChampionIcon champion={championOfParticipant?.get(event.victimId.toString())} size={SizeType.Small} dead={true}/>
          </div>
        ))}

        {matchTimeline &&
          <div>
            <input
            className='w-full'
              value={frame}
              onChange={handleRangeChange}
              type="range"
              min={0}
              max={matchTimeline.info.frames.length - 1}
            />
            {String(Math.floor(matchTimeline.info.frames[frame].timestamp / 1000 / 60)).padStart(2, '0') + "m" + String(Math.round(matchTimeline.info.frames[frame].timestamp / 1000 % 60)).padStart(2, '0') + "s"}
          </div>
        }
      </div>

    </div>
  )
}
