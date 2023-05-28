import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';

const baseUrl = 'http://localhost:3000/';
const getSummonerNameUrl = baseUrl + 'summoner-names/';

export default function SearchBar() {
  const [input, setInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const inputValue: string = event.target.value;
    setInput(inputValue);

    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    try {
      const response: AxiosResponse<string[]> = await axios.get(getSummonerNameUrl);
      const suggestionsData: string[] = response.data;
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error occurred while fetching suggestions:', error);
    }
  };

  function handleSuggestionClick(suggestion: string): void {
    setInput(suggestion);
    setSuggestions([]);
  };

  // Filter suggestions based on input value
  const filteredSuggestions = suggestions.filter((name) =>
    name.toLowerCase().startsWith(input.toLowerCase())
  );

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if (!input.trim()) {
      console.error('No input', input);
      return;
    }

    navigate(`/league-details?summoner=${input}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <div className="h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center border-orange-300 border-2">
        <p className="font-bold">EUW</p>
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          className="h-10 w-96 rounded-2xl p-2 border-orange-300 border-2"
        />

        {filteredSuggestions.length > 0 && (
          <ul className="bg-white w-96 p-2 border border-gray-300 rounded absolute z-10">
            {filteredSuggestions.map((suggestion: string) => (
              <li
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="cursor-pointer hover:bg-gray-200 p-1 rounded"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </form>
  );
}
