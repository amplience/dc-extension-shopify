import NextImage, { ImageProps } from 'next/image';
import React from 'react';

export type AmplienceImage = {
  defaultHost: string;
  name: string;
  endpoint: string;
};

type VisImageProps = Omit<ImageProps, 'src'> & {
  image?: AmplienceImage;
  src?: string;
  aspectRatio?: string;
  alt?: string | undefined;
};

const Image = ({
  image,
  width,
  src,
  aspectRatio,
  alt,
  ...rest
}: VisImageProps) => {
  const altText = alt?.length
    ? alt
    : 'Bodybuilding.com - Huge Online Supplement Store & Fitness Community!';
  const aspect = aspectRatio ? `&sm=aspect&aspect=${aspectRatio}` : '&sm=c';

  const baseURL = `https://${image?.defaultHost}/i/${image?.endpoint}/${
    image?.name
  }?w=${
    width ?? '1800'
  }${aspect}&poi={$this.metadata.pointOfInterest.x},{$this.metadata.pointOfInterest.y},{$this.metadata.pointOfInterest.w},{$this.metadata.pointOfInterest.h}&scaleFit=poi`;
  if (!src && !image) return null;
  return (
    <NextImage
      src={src ? src : baseURL}
      unoptimized={true}
      width={width}
      alt={altText}
      {...rest}
    />
  );
};

export default Image;
