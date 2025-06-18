import React, { useState } from 'react';
import MobileDriverLogin from './MobileDriverLogin';
import MobileDriverApp from './MobileDriverApp';

const MobileDriverInterface: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [driverData, setDriverData] = useState(null);

  const handleLogin = (data: any) => {
    setDriverData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setDriverData(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <MobileDriverLogin onLogin={handleLogin} />;
  }

  return <MobileDriverApp />;
};

export default MobileDriverInterface;