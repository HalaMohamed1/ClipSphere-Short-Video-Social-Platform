'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signup page
    router.replace('/signup');
  }, [router]);

  return null;
}
