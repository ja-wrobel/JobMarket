import React, { useEffect } from 'react';
import "../css/App.css";
import "../css/Header.css";
import useScrollDirection from "../hooks/scrollDirection";
import MenuComponent from './MenuContener';

function Header() {
    const scrollDirection = useScrollDirection();
    useEffect(()=>{
      const icon = document.getElementById('search-icon');
      const msg = document.getElementById('search-message');
      icon.addEventListener('click', ()=>{
        msg.style.display = "block";
        setTimeout(()=>{
          msg.style.display = "none";
        }, 1500)
      })
    },[])
    return (
      <>
        <div className={`header ${ scrollDirection === "down" ? "down" : "up"}`} id='header'>
          <div id='header-menu'>
            <div id='slide-ctrl'>
              <div id='menu-btn'>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <MenuComponent/>
            </div>
          </div>
          <div id='header-title'>
            <h1 id='header-h1'>Most popular technologies</h1>
            <h5 id='header-h5'>according to junior job market</h5>
          </div>
          <div id='search'>
            <div id='search-icon'><img className='icon search' src='/search-var-flat.png'></img></div>
            <div id='search-message'>Just use Ctrl<img className='icon' src='/blue-plus-icon.png'></img>F...</div>
          </div>
        </div>
      </>
    );
  };

export default Header