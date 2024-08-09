'use client'
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProjects } from '@/utils/solana';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ProjectList from './components/ProjectList';
import CreateProjectButton from './components/CreateProjectButton';

export default function Home() {
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [otherProjects, setOtherProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wallet = useWallet();

  const fetchProjects = async () => {
    if (!wallet.publicKey) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProjects = await getProjects(wallet);
      setUserProjects(fetchedProjects.filter(project =>
        project.account.creator.toString() === wallet.publicKey?.toString()
      ));
      setOtherProjects(fetchedProjects.filter(project =>
        project.account.creator.toString() !== wallet.publicKey?.toString()
      ));
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred while fetching projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [wallet.publicKey]);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="flex flex-col gap-8 mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
        <div className="flex flex-wrap justify-between">
          <h1 className="text-3xl font-bold mb-6 text-center">Crowdfunding Projects</h1>
          <CreateProjectButton />
        </div>
        {error && <div className="alert alert-error shadow-lg mb-4">{error}</div>}
        {isLoading ? (
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
              <ProjectList initialProjects={userProjects} />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Other Projects</h2>
              <ProjectList initialProjects={otherProjects} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
