import React from 'react';
import "../css/App.css";
import "../css/Header.css";
import useScrollDirection from "../hooks/scrollDirection";
import MenuContener from './MenuContener';
import SearchInput from './inputs/SearchInput';

function Header() {
    const scrollDirection = useScrollDirection();
    const showInput = ()=>{
        const msg = document.getElementById('search-message');
        if(msg.style.display == 'none'){ msg.style.display = 'block';}
        else{ msg.style.display = 'none';}
    }

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
              <MenuContener/>
            </div>
          </div>
          <div id='header-title'>
            <h1 id='header-h1'>Most popular technologies</h1>
            <h5 id='header-h5'>according to junior job market</h5>
          </div>
          <div id='search'>
            <div id='search-icon' ><img onClick={showInput} className='icon search' src='/search-var-flat.png'></img></div>
            <div id='search-message' style={{display: 'none'}}><SearchInput/></div>
          </div>
        </div>
      </>
    );
  };

export default Header