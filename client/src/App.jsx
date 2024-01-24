import {Routes, Route} from "react-router-dom";
import React from 'react'
import "./css/App.css";
import Header from "./components/Header";
import Main from "./routes/Main";
import Sorted from "./routes/Sorted";
import SortedByTech from "./routes/SortedByTech";
import TechInfo from "./routes/TechInfo";
import Page_up_down from "./components/buttons/Page_up_down";

function App() {
  return (
    <>
        <div className="App" id="App">
          <Header />
          <Routes>
            <Route path="/" element={<Main/>}/>
            <Route path="/_info/*" element={<Main/>}/>
            <Route path="/sort/:spec/*" element={<Sorted/>}/>
            <Route path="/tech/:type" element={<SortedByTech/>}/>
            <Route path="/sort/:spec/tech/:type" element={<Sorted/>}/>
          </Routes>
          <div id="info_tab" className="fancy_scroll">
            <Routes>
              <Route path="/" element={null}></Route>
              <Route path="/_info/:name/*" element={<TechInfo/>}/>
              <Route path="/sort/:spec" element={null}></Route>
              <Route path="/tech/:type" element={null}></Route>
              <Route path="/sort/:spec/_info/:name" element={<TechInfo/>}/>
              <Route path="/sort/:spec/tech/:type" element={null}/>
            </Routes>
          </div>
          <Page_up_down/>
        </div>
    </>
  )
}
export default App

















