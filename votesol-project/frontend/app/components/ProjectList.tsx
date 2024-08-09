'use client';
// components/ProjectList.tsx
'use client';

import useSWR from 'swr';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProjects } from '@/utils/solana';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


//TODO: fix types
export default function ProjectList({ initialProjects }: any) {
  const wallet = useWallet();
  //@ts-ignore
  const fetcher = () => getProjects(wallet);
  const { data: projects, error, isLoading } = useSWR('projects', fetcher, {
    fallbackData: initialProjects,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (isLoading) {
    return (
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error shadow-lg mb-4">{error.message}</div>;
  }

  if (!projects || projects.length === 0) {
    return <p className="text-center">No projects found. Be the first to create one!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((project: any, index: number) => (
        <div key={index} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{project.account.title}</h2>
            <p>{project.account.description}</p>
            <p className="text-primary">Target: {(project.account.target / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Invest</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
