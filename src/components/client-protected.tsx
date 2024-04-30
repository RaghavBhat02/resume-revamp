import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/authcontext';
export default function ClientProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const router = useRouter()
  if (!user) {
    return (
      <main className="md:p-8 p-4">
        You need to log in to use this page.
      </main>
    )
  }
  return <>{children}</>;
}

