import { ObjectId } from "mongodb";

export interface SummonerDTO {
  accountId: string,
  profileIconId: number,
  revisionDate: number,
  name: string,
  id: string,
  puuid: string,
  summonerLevel: number
}

export interface ChampionMasteryDto {
  championPointsUntilNextLevel: number,
  chestGranted: boolean,
  championId: number,
  lastPlayTime: number, // Unix milliseconds
  championLevel: number,
  summonerId: string,
  championPoints: number,
  championPointsSinceLastLevel: number,
  tokensEarned: number
}

export interface LeagueEntryDTO {
  leagueId: string,
  summonerId: string,
  summonerName: string,
  queueType: string,
  tier: string,
  rank: string,
  leaguePoints: number,
  wins: number,
  losses: number,
  hotStreak: boolean,
  veteran: boolean,
  freshBlood: boolean,
  inactive: boolean,
  miniSeries: MiniSeriesDTO
}

export interface MiniSeriesDTO {
  losses: number,
  progress: string,
  target: number,
  wins: number
}

export interface SummonerData {
  _id: ObjectId | undefined;
  timestamp: Date | undefined;
  summonerDto: SummonerDTO;
  leagueEntryDto: LeagueEntryDTO[];
};

export interface SummonersMatchesRelationsData {
  _id: ObjectId | undefined;  // puuid
  timestamp: Date | undefined;
  matches: string[];
};

export interface MatchDTO {
  _id: ObjectId | undefined;  // matchId
  timestamp: Date | undefined;
  metadata: any;
  info: any;
};