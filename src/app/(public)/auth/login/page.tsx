import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { LoginForm } from '@/components/auth';

export const metadata: Metadata = constructMetadata({
  title: 'Sign In',
  flow: 'Auth',
  description: 'Sign in to your TaskFlow workspace to manage tasks, sprints, and team workflows.',
});

export default function LoginPage() {
  return <LoginForm />;
}
