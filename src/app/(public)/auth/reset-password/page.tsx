import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { constructMetadata } from '@/helpers';
import { ResetPasswordForm } from '@/components/auth';
import { Loader } from '@/components/ui';
import { RESET_PASSWORD_CONSTANTS } from '@/constants';

export const metadata: Metadata = constructMetadata({
  title: RESET_PASSWORD_CONSTANTS.metadata.title,
  flow: RESET_PASSWORD_CONSTANTS.metadata.flow,
  description: RESET_PASSWORD_CONSTANTS.metadata.description,
});

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 w-full items-center justify-center">
          <Loader size="md" variant="gradient" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
