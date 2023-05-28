import React, { useEffect, useState } from 'react';

export default function SummonerIcon({ icon }: { icon?: number }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (!icon) {
      icon = 0;
    }

    import(`../../assets/profileicon/${icon}.png`)
      .then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading summoner icon:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [icon]);

  return (
    <img
      src={image}
      alt="Summoner Icon"
      className="rounded-full w-24 h-24 sm:w-40 sm:h-40 transform hover:rotate-12 hover:scale-150 duration-300"
    />
  );
}
