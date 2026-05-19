import React from 'react';

interface Props {
  message?: string;
}

const LoadingSpinner: React.FC<Props> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-xbox-green-light"></div>
      <p className="mt-4 text-dark-300">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
