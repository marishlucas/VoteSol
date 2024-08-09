// app/page.tsx
// app/page.tsx
import { getProjects } from '@/utils/solana';
import Navbar from '@/components/Navbar';
import ProjectList from '@/components/ProjectList';
import CreateProjectButton from '@/components/CreateProjectButton';

export default async function Home() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Crowdfunding Projects</h1>

        <ProjectList initialProjects={projects} />

        <div className="mt-8 text-center">
          <CreateProjectButton />
        </div>
      </div>
    </div>
  );
}
