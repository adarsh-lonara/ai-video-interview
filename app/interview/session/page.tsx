'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InterviewSession from '@/components/InterviewSession';

export default function InterviewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !sessionId) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router, sessionId]);

  if (!isAuthenticated || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get duration from session or default to 10 minutes
  const duration = parseInt(searchParams.get('duration') || '10');
  const domain = searchParams.get('domain') || 'General';

  return (
    <InterviewSession sessionId={sessionId} duration={duration} domain={domain} />
  );
}
