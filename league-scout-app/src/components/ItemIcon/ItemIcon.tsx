import React, { useEffect, useState } from 'react';

export enum SizeType {
  Big,
  Medium,
  Small
}

export default function ItemIcon({ item, size }: { item?: number, size?: SizeType }) {
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (item === undefined) {
      return;
    }

    import(`../../assets/item/${item}.png`).then((imageModule) => {
        if (isMounted) {
          setImage(imageModule.default);
        }
      })
      .catch((error) => {
        console.error('Error loading item icon. Using empty icon');

        import('../../assets/item/0.png').then((imageModule) => {
          if (isMounted) {
            setImage(imageModule.default);
          }
        })
      });

    return () => {
      isMounted = false;
    };
  }, [item]);

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
      alt="Item Icon"
      className={`${classNameImageSize} rounded-md`}
    />
  );
}
