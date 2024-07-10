import React from "react";
import { useState, useEffect } from "react";
import validateString from "../hooks/validateString";
import getData from "../hooks/getData";
import ListElement from "../components/ListElement";
import ErrorMessage from "../components/ErrorMessage";

export default function Main(){
    const [entries, setEntries] = useState([]);

    const setData = async ()=>{
      const data = await getData("/");
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