import type { Metadata } from 'next';
import { constructMetadata } from '@/helpers';
import { ForgotPasswordForm } from '@/components/auth';
import { FORGOT_PASSWORD_CONSTANTS } from '@/constants';

export const metadata: Metadata = constructMetadata({
  title: FORGOT_PASSWORD_CONSTANTS.metadata.title,
  flow: FORGOT_PASSWORD_CONSTANTS.metadata.flow,
  description: FORGOT_PASSWORD_CONSTANTS.metadata.description,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
