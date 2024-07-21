import React from "react";
import { useState, useEffect } from "react";
import validateString from "../hooks/validateString";
import forgeRequest from "../hooks/forgeRequest";
import ListElement from "../components/ListElement";
import ErrorMessage from "../components/ErrorMessage";

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