import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import validateString from "../hooks/validateString";
import forgeRequest from "../hooks/forgeRequest";
import ListElement from "../components/ListElement";
import ErrorMessage from "../components/ErrorMessage";

export default function Sorted(){
    const [entries, setEntries] = useState([]);
    const {spec} = useParams();

    const setData = async ()=>{
        const data = await forgeRequest(`/specs/${spec}`, 'GET');
        setEntries(data);
    }
    useEffect(()=>{
        setData();
    },[spec]);
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
                            key={`${entry.name}${entry._id}`} 
                            route={`/sort/${spec}/_info/${new_val}/`} 
                            entry={entry}
                        />
                    )
                    })}
                </ul>
            </div>
            <br/>
        </>
    );
}