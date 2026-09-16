'use client';

import React, { useState } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

export interface ImageProps extends Omit<NextImageProps, 'alt'> {
  alt: string;
  fallbackSrc?: string;
  containerClassName?: string;
  as?: 'span' | 'div';
}

export const Image: React.FC<Readonly<ImageProps>> = ({
  src,
  alt,
  fallbackSrc = '/file.svg',
  containerClassName = '',
  className = '',
  as,
  onLoad,
  onError,
  ...props
}) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
    }
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  const currentSrc = hasError && fallbackSrc ? fallbackSrc : src;
  const ContainerTag = as || (props.fill ? 'div' : 'span');

  return (
    <ContainerTag
      className={`relative overflow-hidden ${
        props.fill ? 'block h-full w-full' : 'inline-flex items-center justify-center'
      } ${containerClassName}`}
    >
      <NextImage
        {...props}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-90'
        } ${className}`}
      />
    </ContainerTag>
  );
};

export default Image;
