// App.js
import React from 'react';
import SalesTable from './components/Sales';
import Navbar from './components/Navbar';



function App() {
  return (
    <div className="App">
      <div>
        <Navbar/>
      </div>
      <header className="App-header">
        <SalesTable />
      
      </header>
    </div>
  );
}

export default App;
