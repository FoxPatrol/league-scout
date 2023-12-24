import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { SummonerDTO } from '../../../../backend/src/interface/interfaces';
import SummonerIcon, { SizeType } from '../SummonerIcon/SummonerIcon';

const baseUrl = 'http://localhost:3000/';
const getSummonerNameUrl = baseUrl + 'summoner-names/';

export default function SearchBar() {
  const [input, setInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<{ name: string; iconId: number }[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSuggestions();
  }, []);

  async function getSuggestions(): Promise<void> {
    try {
      const response: AxiosResponse<SummonerDTO[]> = await axios.get(getSummonerNameUrl);
      const suggestionsData: { name: string; iconId: number }[] = response.data.map((summonerDto) => {
        return { name: summonerDto.name, iconId: summonerDto.profileIconId };
      });
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error occurred while fetching suggestions:', error);
    }
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const inputValue: string = event.target.value;
    setInput(inputValue);
  }

  function handleSuggestionClick(suggestion: string): void {
    if (!suggestion.trim()) {
      console.error('No suggestion', suggestion);
      return;
    }

    navigate(`/league-details?summoner=${suggestion}`);
  }

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if (!input.trim()) {
      console.error('No input', input);
      return;
    }

    navigate(`/league-details?summoner=${input}`);
  }

  function handleFocus(): void {
    setIsFocused(true);
  }

  function handleBlur(): void {
    // need timeout so that can click on suggestions
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
  }

  // Filter suggestions based on input value
  const filteredSuggestions = suggestions.filter((sug) => sug.name.toLowerCase().startsWith(input.toLowerCase()));

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center justify-center h-full">
      <div className="h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center border-orange-300 border-2">
        <p className="font-bold">EUW</p>
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="h-10 w-96 rounded-2xl p-2 border-orange-300 border-2"
        />

        {isFocused && filteredSuggestions.length > 0 && (
          <ul className="bg-white w-96 p-2 border border-gray-300 rounded absolute z-10 max-h-96 overflow-y-scroll">
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion.name}
                onClick={() => handleSuggestionClick(suggestion.name)}
                className="cursor-pointer p-1 hover:bg-gray-200 rounded flex items-center"
              >
                <SummonerIcon icon={suggestion.iconId} size={SizeType.Small} />
                <span className="mx-auto">{suggestion.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
