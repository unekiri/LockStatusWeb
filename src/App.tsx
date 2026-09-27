import React from 'react';
import LockStatus from './components/LockStatus';
import './styles/LockStatus.css';

const App: React.FC = () => (
  <div className="app">
    <h1>施錠状態管理</h1>
    <LockStatus />
  </div>
);

export default App;
