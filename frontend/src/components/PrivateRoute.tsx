import React from 'react';

// This is a placeholder. Replace with your real auth logic.
export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // You can add real authentication logic here
  // For now, always render children
  return <>{children}</>;
};

export default PrivateRoute; 