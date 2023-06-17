import { useEffect, useState } from 'react'
import axios from 'axios';

const baseUrl = 'http://localhost:3000';
let getMatchTimelineUrl = baseUrl + '/matches/{matchId}/timeline';

export default function Timeline() {
  const [matchTimeline, setMatchTimeline] = useState<any>();

  useEffect(() => {
    const location = window.location;
    const searchParams = new URLSearchParams(location.search);
    const matchId = searchParams.get("matchId");

    if(matchId)
    {
    }

    if(!matchId)
    {
      console.error("Match id empty", matchId)
      return
    }

    getMatchTimelineData(matchId);
    return;
  }, [])

  async function getMatchTimelineData(matchId: string): Promise<any> {
    const url = getMatchTimelineUrl.replace("{matchId}", matchId);

    try {
    const response = await axios.get(url);
      const data = response.data;
      setMatchTimeline(data);
      console.log(data)
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div>

    </div>
  )
}
