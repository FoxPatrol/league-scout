import React, { useEffect, useState } from 'react';
import itemJsonData from '../../assets/item.json';

export enum SizeType {
  Big,
  Medium,
  Small
}

export default function ItemIcon({ item, size }: { item?: number, size?: SizeType }) {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);

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
        console.error('Error loading item icon. Using empty item icon. Desired item:', item);

        import('../../assets/item/0.png').then((imageModule) => {
          if (isMounted) {
            setImage(imageModule.default);
          }
        })
      });

    //@ts-ignore
    const itemData = itemJsonData.data[item];

    if(itemData)
    {
      // Parse the description using DOMParser
      const parser = new DOMParser();
      const descriptionDocument = parser.parseFromString(itemData.description, 'text/html');
      const mainTextElement = descriptionDocument.getElementsByTagName('mainText')[0];

      if (mainTextElement) {
        // Convert child elements to string representation with line breaks
        let mainText = '';
        Array.from(mainTextElement.childNodes).forEach((node) => {
            if (node.nodeName === 'BR') {
              mainText += '\n'; // Add line break when <br> element is encountered
            } else if (node.nodeName === 'STATS') {
              Array.from(node.childNodes).forEach((statsNode) => {
                if (statsNode.nodeName === 'BR') {
                  mainText += '\n'; // Add line break when <br> element is encountered within <stats>
                } else {
                  mainText += statsNode.textContent;
                }
              });
            } else if (node.nodeName === 'LI') {
                mainText += '\n'; // Add line break when <li> element is encountered
                Array.from(node.childNodes).forEach((liNode) => {
                if (liNode.nodeName === 'BR') {
                  mainText += '\n'; // Add line break when <br> element is encountered within <stats>
                } else {
                  mainText += liNode.textContent;
                }
              });
            } else {
              mainText += node.textContent;
            }
        });

        setDescription(mainText);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [item]);

  let classNameImageSize = '';
  switch (size) {
    case SizeType.Small:
      classNameImageSize = 'w-7 h-7';
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
      //@ts-ignore
      title={item && itemJsonData.data[item] && `${itemJsonData.data[item].name} - ${itemJsonData.data[item].gold.total}g\n\n${description}`}
      className={`${classNameImageSize} rounded-md`}
    />
  );
}
