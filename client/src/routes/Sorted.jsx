import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import validateString from "../hooks/validateString";
import getData from "../hooks/getData";
import ListElement from "../components/ListElement";

export default function Sorted(){
    const [entries, setEntries] = useState([]);
    const {spec} = useParams();

    const setData = async ()=>{
        const data = await getData(`/specs/${spec}`);
        setEntries(data);
    }
    useEffect(()=>{
        setData();
    },[spec]);
    return(
        <>
            <div id="list-div">
                <ul id="list" className='langList'>
                    {entries.map((entry)=>{

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