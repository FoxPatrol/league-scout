import React, { useEffect, useState } from 'react';
import * as runesReforgedJson from '../../assets/runesReforged.json';

export enum SizeType {
  Big,
  Medium,
  Small,
}

type perkType = {
  perk: number;
  var1: number;
  var2: number;
  var3: number;
};

type runeProp = {
  description: string;
  selections: perkType[];
  style: number;
};

export default function RuneIcon({ rune, size }: { rune?: runeProp; size?: SizeType }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  function getImageSrc(rune: runeProp) {
    // Iterate through each element in the summonerDict
    for (const perkJson of runesReforgedJson.default) {
      if (perkJson.id == rune.style) {
        if (rune.description == 'subStyle') {
          return perkJson.icon.toLowerCase();
        }

        for (const runeJson of perkJson.slots[0].runes) {
          if (runeJson.id == rune.selections[0].perk) {
            return runeJson.icon.toLowerCase();
          }
        }
      }
    }

    return 'item/1004';
  }

  useEffect(() => {
    let isMounted = true;

    if (rune === undefined) {
      return;
    }

    let imageSrc = getImageSrc(rune);

    const src = `../../assets/${imageSrc}`;
    import(src)
      .then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading rune icon. Desired rune:', rune);

        import('../../assets/item/1004.png').then((imageModule) => {
          if (isMounted) {
            setImage(imageModule.default);
          }
        });
      });

    return () => {
      isMounted = false;
    };
  }, [rune]);

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

  return <img src={image} alt="Rune Icon" className={`${classNameImageSize} rounded-md bg-gray-800`} />;
}
