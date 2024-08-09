'use client'
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { createProject } from '@/utils/solana';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';

export default function CreateProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, signTransaction } = useWallet();
  const router = useRouter();

  const wallet = useWallet();

  if (!publicKey) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello there</h1>
            <p className="py-6">Please connect your wallet to create a project.</p>
          </div>
        </div>
      </div>
    );
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!signTransaction) throw new Error("Wallet is not connected");
      //@ts-ignore
      await createProject(wallet, title, description, parseFloat(target));
      alert('Project created successfully!');

      // Trigger a revalidation of the projects cache
      mutate('projects');

      router.push('/');
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Create a New Project</h1>
        {error && <div className="alert alert-error shadow-lg mb-4">{error}</div>}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project Title</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  required
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project Description</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project"
                  required
                  className="textarea textarea-bordered h-24"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Funding Target (SOL)</span>
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Enter target amount"
                  required
                  className="input input-bordered w-full"
                />
              </div>
              <button
                className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
