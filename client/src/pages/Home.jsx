import React from 'react';
import { Feed } from '../components/Feed';
import { CreatePost } from '../components/CreatePost';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <CreatePost />}
      <Feed />
    </>
  );
};

export default Home;
