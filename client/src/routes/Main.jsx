import React from "react";
import { useState, useEffect } from "react";
import validateString from "../hooks/validateString.js";
import forgeRequest from "../hooks/ReqHandler/forgeRequest.js";
import ListElement from "../components/ListElement.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

export default function Main(){
    const [entries, setEntries] = useState([]);

    const setData = async ()=>{
        const data = await forgeRequest("/", "GET");
        setEntries(data);
    }
    useEffect(()=>{
        setData();    
    }, []);
    return(
    <>
        <div id="list-div">
            <ul id="list" className='langList'>
                {typeof entries === 'number' ? <ErrorMessage status={entries}/> 
                : 
                entries.map((entry)=>{

                let new_val = validateString(entry.name);

                return  (
                    <ListElement 
                        key={`${entry._id}`} 
                        route={`/_info/${new_val}/`} 
                        entry={entry}
                    />
                )
                })}
            </ul>
        </div>
        <br/>
    </>
    )
}