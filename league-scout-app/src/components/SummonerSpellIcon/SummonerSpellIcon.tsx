import React, { useEffect, useState } from 'react';

export enum SizeType {
  Big,
  Medium,
  Small
}

export default function SummonerSpellIcon({ summonerSpell, size }: { summonerSpell?: number, size?: SizeType }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (summonerSpell === undefined) {
      return;
    }

    import(`../../assets/summoner-spell/${summonerSpell}.png`).then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading summoner spell icon. Desired summoner spell:', summonerSpell);

        import('../../assets/summoner-spell/1.png').then((imageModule) => {
          if (isMounted) {
            setImage(imageModule.default);
          }
        })
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

  return (
    <img
      src={image}
      alt="Summoner Spell Icon"
      className={`${classNameImageSize} rounded-md`}
    />
  );
}
