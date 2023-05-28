import React, { useEffect, useState } from 'react';

export default function RankIcon({ icon }: { icon?: string }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (!icon) {
      icon = 'provisional';
    }

    import(`../../assets/base-icons/${icon.toLowerCase()}.png`)
      .then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading rank icon:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [icon]);

  return (
    <img
      src={image}
      alt="Rank Icon"
      className="w-20 h-20 sm:w-36 sm:h-36 transform hover:scale-150 duration-300"
    />
  );
}
