// components/CreateProjectButton.tsx
'use client';

import Link from 'next/link';

export default function CreateProjectButton() {
  return (
    <Link href="/create-project" className="btn btn-primary">
      Create New Project
    </Link>
  );
}
