import React from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from '../RightSidebar';
import MobileNav from '../MobileNav';

const MainLayout = ({ children }) => {
  const router = useRouter();
  const isAuthPage = router.pathname.startsWith('/auth');

  if (isAuthPage) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <Sidebar />
          <main className="flex-1">{children}</main>
          <RightSidebar />
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default MainLayout; 