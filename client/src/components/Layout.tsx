import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import CreatePostButton from './CreatePostButton';
import '../styles/global.css';

function Layout() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
      <CreatePostButton />
    </div>
  );
}

export default Layout; 