import React, { useEffect, useState } from 'react';

export enum SizeType {
  Big,
  Medium,
  Small
}

export default function SummonerIcon({ icon, size }: { icon?: number, size?: SizeType }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (!icon) {
      icon = 0;
    }

    import(`../../assets/profileicon/${icon}.png`).then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading summoner icon, using default.');

        import(`../../assets/profileicon/0.png`).then((imageModule) => {
          if (isMounted) {
            setImage(imageModule.default);
          }
        })
      });

    return () => {
      isMounted = false;
    };
  }, [icon]);

  let classNameImageSize = '';
  switch (size) {
    case SizeType.Small:
      classNameImageSize = 'w-12 h-12';
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
      alt="Summoner Icon"
      className={`rounded-full ${classNameImageSize} transform hover:rotate-12 hover:scale-150 duration-300`}
    />
  );
}
