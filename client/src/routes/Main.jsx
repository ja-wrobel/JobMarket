import React from "react";
import { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";
const special_chars = ["#", "?", "/", ":", ";", "=", "@", ","];
const corrected_chars = ["%23", "%22", "%2F", "%3A", "%3B", "%3D", "%40", "%2C"];
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

                let new_val = val.name;
                for(let i=0;i<special_chars.length;i++){
                  if(new_val.includes(special_chars[i]))new_val = new_val.replace(special_chars[i], corrected_chars[i])
                }

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