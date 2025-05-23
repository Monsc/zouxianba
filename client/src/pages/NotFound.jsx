import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">页面未找到</p>
        <Button
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          返回首页
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
