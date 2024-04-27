import React from "react";
import { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
import validateString from "../hooks/validateString";

const port = import.meta.env.VITE_SERVER_PORT || 8080;
const uri = import.meta.env.VITE_SERVER_URL || "http://localhost";

export default function Main(){
    const [allLangs, setAllLangs] = useState([]);
    const navigate = useNavigate();
    const fetchData = ()=>{
      fetch(`${uri}:${port}/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
      })
        .then(response => {
          return response.json()
        }, reason => {
          return console.log(reason)
        })
        .then(data =>{
          setAllLangs(data)
        })
    }
  
    useEffect(()=>{
      fetchData();
    }, []);
    return(
    <>
        <div id="list-div">
            <ul id="list" className='langList'>
                {allLangs.map((val)=>{

                let new_val = validateString(val.name);

                return  (<li className="li_element" onClick={()=>{
                            navigate(`/_info/${new_val}/`);
                            const display = document.getElementById('info_tab');
                            if(display !== null)display.style.display = 'block';
                        }} 
                        id={val.name} key={val._id}>
                            <h2 value={val.value}>{val.name}&nbsp;-&nbsp;{val.value}</h2>
                            <p id="p_info">Click for more info</p>
                        </li>)
                })}
            </ul>
        </div>
        <br/>
    </>
    )
}