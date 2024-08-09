'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProjects } from '@/utils/solana';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface Project {
  account: {
    title: string;
    description: string;
    target: number;
    amountCollected: number;
  };
}

interface ProjectListProps {
  type: 'user' | 'other';
}

export default function ProjectList({ type }: ProjectListProps) {
  const wallet = useWallet();
  const [isWalletReady, setIsWalletReady] = useState(false);

  useEffect(() => {
    if (wallet.publicKey) {
      setIsWalletReady(true);
    }
  }, [wallet.publicKey]);

  const fetcher = async () => {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    //@ts-ignore
    const allProjects = await getProjects(wallet);
    return type === 'user' ? allProjects.userProjects : allProjects.otherProjects;
  };

  const { data: projects, error, isValidating } = useSWR(
    isWalletReady ? `projects-${type}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  if (!isWalletReady || isValidating) {
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
      {projects.map((project: Project, index: number) => (
        <div key={index} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{project.account.title}</h2>
            <p>{project.account.description}</p>
            <p className="text-primary">Target: {(project.account.target / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
            <p className="text-secondary">Collected: {(project.account.amountCollected / LAMPORTS_PER_SOL).toFixed(2)} SOL</p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-outline">Details</button>
              <button className="btn btn-primary">Invest</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
