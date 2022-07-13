import NextImage, { ImageProps } from 'next/image';
import React from 'react';


type VisImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  alt?: string | undefined;
};

const Image = ({
  width,
  src,
  alt,
  ...rest
}: VisImageProps) => {
  const altText = alt?.length
    ? alt
    : 'Placeholder Alt Text';

  if (!src) return null;
  return (
    <NextImage
      src={src}
      unoptimized={true}
      width={width}
      alt={altText}
      {...rest}
    />
  );
};

export default Image;
