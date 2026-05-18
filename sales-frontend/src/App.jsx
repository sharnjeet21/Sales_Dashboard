import React from 'react';
import Navbar from './components/Navbar';
import SalesTable from './components/Sales';

function App() {
  return (
    <div className="bg-mesh min-h-screen">
      {/* Floating ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* Content layer */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <SalesTable />
        </main>
      </div>
    </div>
  );
}

export default App;
