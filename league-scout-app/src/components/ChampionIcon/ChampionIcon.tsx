import React, { useEffect, useState } from 'react';

export enum SizeType {
  Big,
  Medium,
  Small
}

export default function ChampionIcon({ champion, size }: { champion?: string, size?: SizeType }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (!champion) {
      return;
    }

    import(`../../assets/champion/${champion}.png`).then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading champion icon. Using amumu crying');

        import(`../../assets/champion/Amumu.png`).then((imageModule) => {
          if (isMounted) {
            setImage(imageModule.default);
          }
        })
      });

    return () => {
      isMounted = false;
    };
  }, [champion]);

  let classNameImageSize = '';
  switch (size) {
    case SizeType.Small:
      classNameImageSize = 'w-8 h-8';
      break;
    case SizeType.Medium:
      classNameImageSize = 'w-16 h-16';
      break;
    case SizeType.Big:
    default:
      classNameImageSize = 'w-24 h-24';
      break;
  }

  return (
    <img
      src={image}
      alt="Champion Icon"
      className={`${classNameImageSize} rounded-full`}
    />
  );
}
