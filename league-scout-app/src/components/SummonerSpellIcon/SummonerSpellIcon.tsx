import React, { useEffect, useState } from 'react';
import * as summonerJson from '../../assets/summoner.json';

export enum SizeType {
  Big,
  Medium,
  Small,
}

export default function SummonerSpellIcon({ summonerSpell, size }: { summonerSpell?: number; size?: SizeType }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (summonerSpell === undefined) {
      return;
    }

    const summonerDict = summonerJson.data;

    const matchSummSpellIdToImage = {};
    // Check if summonerDict is an object
    if (typeof summonerDict === 'object' && summonerDict !== null) {
      // Initialize a new dictionary

      // Iterate through each element in the summonerDict
      for (const key in summonerDict) {
        if (summonerDict.hasOwnProperty(key)) {
          // Access the "key" and "image.full" properties
          const summonerKey = summonerDict[key].key;
          const summonerImageFull = summonerDict[key].image.full;

          // Assign to the new dictionary
          matchSummSpellIdToImage[summonerKey] = summonerImageFull;
        }
      }
    }

    const src = `../../assets/spell/${matchSummSpellIdToImage[summonerSpell.toString()]}`;
    import(src)
      .then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading summoner spell icon. Desired summoner spell:', summonerSpell);

        import('../../assets/spell/Summoner_UltBookPlaceholder.png').then((imageModule) => {
          if (isMounted) {
            setImage(imageModule.default);
          }
        });
      });

    return () => {
      isMounted = false;
    };
  }, [summonerSpell]);

  let classNameImageSize = '';
  switch (size) {
    case SizeType.Small:
      classNameImageSize = 'w-6 h-6';
      break;
    case SizeType.Medium:
      classNameImageSize = 'w-12 h-12';
      break;
    case SizeType.Big:
    default:
      classNameImageSize = 'w-20 h-20';
      break;
  }

  return <img src={image} alt="Summoner Spell Icon" className={`${classNameImageSize} rounded-md`} />;
}
