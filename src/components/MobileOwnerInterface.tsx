import React, { useState } from 'react';
import MobileOwnerLogin from './MobileOwnerLogin';
import MobileOwnerApp from './MobileOwnerApp';

const MobileOwnerInterface: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ownerData, setOwnerData] = useState(null);

  const handleLogin = (data: any) => {
    setOwnerData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setOwnerData(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <MobileOwnerLogin onLogin={handleLogin} />;
  }

  return <MobileOwnerApp ownerData={ownerData} onLogout={handleLogout} />;
};

export default MobileOwnerInterface;