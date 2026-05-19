'use client';

import React from 'react';
import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';

function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default App;
