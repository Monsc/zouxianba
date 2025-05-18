import React from 'react';

function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="error-message text-red-500 text-sm mt-1">{message}</div>;
}

export default ErrorMessage;
