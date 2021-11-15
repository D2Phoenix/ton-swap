import React from 'react';
import './App.scss';

function App() {
  return (
      <>
          <div className="header-wrapper">
              <header>
                  <a href="/" className="logo" />
              </header>
              <nav>
                  <div className="nav-wrapper">
                      <div className="nav-item">
                          <a className="nav-item__btn">Toncoin</a>
                      </div>
                  </div>
              </nav>
          </div>
          <main>
              <div className="container">

              </div>
          </main>
          <footer>
              <div className="container"/>
          </footer>
      </>
  );
}

export default App;
