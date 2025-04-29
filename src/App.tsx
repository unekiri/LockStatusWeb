import React, { useState } from 'react';
import LockStatus from './components/LockStatus';
import './styles/LockStatus.css';

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);

  const handleStatusChange = (newStatus: boolean) => {
    setIsLocked(newStatus);
  };

  return (
    <div className="app">
      <h1>施錠状態管理</h1>
      <LockStatus 
        isLocked={isLocked}
      />
    </div>
  );
};

export default App; 