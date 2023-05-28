import React, { useState } from 'react'

const getSummonerNameUrl = 'http://localhost:3000/summoner-name/';

export default function SearchBar() {
  const [input, setInput] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if(!input)
    {
      console.error("no input", input)
      return
    }
    console.log(input)

    fetch(`${getSummonerNameUrl}${input}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Process the response data as per your requirements
      })
      .catch((error) => {
        console.error('Error:', error);
        // Handle the error as needed
      });
  };

  return (
    <form onSubmit={handleSubmit} className='flex gap-3 items-center'>
      <div className='h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center border-orange-300 border-2'>
        <p className='font-bold'>EUW</p>
      </div>

      <input
        type='text'
        value={input}
        onChange={handleChange}
        className='h-10 w-96 rounded-2xl p-2 border-orange-300 border-2'
      />
    </form>
  );
}
