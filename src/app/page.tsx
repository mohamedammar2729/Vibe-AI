import { trpc } from '@/trpc/server';
import { HydrationBoundary, useQueryClient } from '@tanstack/react-query';
import Client from './Client';
import { Suspense } from 'react';

const Page = () => {
  const queryClient = useQueryClient();
  void queryClient.prefetchQuery(trpc.createAI.queryOptions({ text: 'ammar' }));
  return (
    <HydrationBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
