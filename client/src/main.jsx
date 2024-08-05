import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { BrowserRouter } from 'react-router-dom';

const sRoot = ReactDOM.createRoot(document.getElementById('pyAccess'));
const root = ReactDOM.createRoot(document.getElementById('main'));
const exp = {
  root1: root,
  root2: sRoot
}
root.render(
    //<React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    //</React.StrictMode>
)
sRoot.render()



export default exp

