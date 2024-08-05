import {Routes, Route} from "react-router-dom";
import React from 'react'
import "./css/App.css";
import Header from "./components/Header/Header.jsx";
import Footer from './components/Footer/Footer.jsx';
import Main from "./routes/Main.jsx";
import Sorted from "./routes/Sorted.jsx";
import SortedByTech from "./routes/SortedByTech.jsx";
import TechInfo from "./routes/TechInfo.jsx";
import Page_up_down from "./components/PageScroll_button.jsx";
import closeInfoTab from "./hooks/closeInfoTab.js";

function App() {
  return (
    <>
    <div className="App" id="App">
        <Routes>
            <Route path="/*" element={<Header/>}/>
        </Routes>
        <Routes>
            <Route path="/" element={<Main/>}/>
            <Route path="/_info/:type" element={<Main/>}/>
            <Route path="/sort/:spec/*" element={<Sorted/>}/>
            <Route path="/tech/:type/*" element={<SortedByTech/>}/>
            <Route path="/sort/:spec/tech/:type/*" element={<Sorted/>}/>
        </Routes>
        <div id="info_tab" className="fancy_scroll">
            <div className="info_btn" onClick={closeInfoTab}>X</div>
            <Routes>
                <Route path="/" element={null}/>
                <Route path="/sort/:spec" element={null}/>
                <Route path="/tech/:type" element={null}/>
                <Route path="/sort/:spec/tech/:type" element={null}/>
                <Route path="/_info/:name" element={<TechInfo/>}/>
                <Route path="/sort/:spec/_info/:name" element={<TechInfo/>}/>
                <Route path="/tech/:type/_info/:name" element={<TechInfo/>}/>
                <Route path="/sort/:spec/tech/:type/_info/:name" element={<TechInfo/>}/>
            </Routes>
        </div>
        <Routes>
            <Route path="/*" element={<Page_up_down/>}/>
        </Routes>
        <Routes>
            <Route path="/*" element={<Footer/>}/>
        </Routes>
    </div>
    </>
  )
}
export default App

















