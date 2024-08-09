import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ProjectList from '@/components/ProjectList';

export default async function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Crowdfunding Projects</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
          <ProjectList type="user" />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Other Projects</h2>
          <ProjectList type="other" />
        </div>

        <div className="mt-8 text-center">
          <Link href="/create-project" className="btn btn-primary">
            Create New Project
          </Link>
        </div>
      </div>
    </div>
  );
}
