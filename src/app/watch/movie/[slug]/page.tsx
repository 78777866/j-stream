import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import { MediaType } from '@/types';

export const revalidate = 3600;

export default function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  return <EmbedPlayer movieId={id} mediaType={MediaType.MOVIE} />;
}
