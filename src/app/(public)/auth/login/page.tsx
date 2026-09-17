import type { Metadata } from 'next';
import { constructMetadata } from '@/helpers';
import { LoginForm } from '@/components/auth';
import { LOGIN_CONSTANTS } from '@/constants';

export const metadata: Metadata = constructMetadata({
  title: LOGIN_CONSTANTS.metadata.title,
  flow: LOGIN_CONSTANTS.metadata.flow,
  description: LOGIN_CONSTANTS.metadata.description,
});

export default function LoginPage() {
  return <LoginForm />;
}
