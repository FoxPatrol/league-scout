import React, { useEffect, useState } from 'react';

export enum SizeType {
  Big,
  Medium,
  Small
}

export default function RuneIcon({ rune, size }: { rune?: number, size?: SizeType }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (rune === undefined) {
      return;
    }

    import(`../../assets/rune/${rune}.png`).then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading rune icon. Desired rune:', rune);

        import('../../assets/rune/8369.png').then((imageModule) => {
          if (isMounted) {
            setImage(imageModule.default);
          }
        })
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

  return (
    <img
      src={image}
      alt="Rune Icon"
      className={`${classNameImageSize} rounded-md bg-gray-800`}
    />
  );
}
