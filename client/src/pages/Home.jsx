import React from 'react';
import { Feed } from '../components/Feed';
import { CreatePost } from '../components/CreatePost';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      {user && <CreatePost />}
      <Feed />
    </div>
  );
};

export default Home;
