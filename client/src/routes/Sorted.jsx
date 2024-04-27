import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import validateString from "../hooks/validateString";
const port = import.meta.env.VITE_SERVER_PORT || 8080;
const uri = import.meta.env.VITE_SERVER_URL || "http://localhost";


export default function Sorted(){
    const [entries, setEntries] = useState([]);
    const {spec} = useParams();
    const navigate = useNavigate();
    const fetchData = async ()=>{
        fetch(`${uri}:${port}/specs/${spec}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
          })
            .then(response => {
                return response.json()
            }, reason => {
                return console.log(reason)
            })
            .then(data =>{
                setEntries(data);
        });
    }
    useEffect(()=>{
        fetchData();
    },[spec]);
    return(
        <>
            <div id="list-div">
                <ul id="list" className='langList'>
                    {entries.map((val)=>{

                    let new_val = validateString(val.name);

                    return  (<li className="li_element" onClick={()=>{
                                navigate(`/sort/${spec}/_info/${new_val}/`);
                                const display = document.getElementById('info_tab');
                                if(display!==null)display.style.display = 'block';
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
    );
}