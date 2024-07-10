import { useState } from "react";
import {useNavigate} from "react-router-dom";
import "../css/Menu.css";
import useMenuControl from "../hooks/menuControl";
import MenuContener_button from "./buttons/MenuContener_button";

export default function MenuContener(){

    const navigate = useNavigate();
    const state = useMenuControl();

    const [filterVal, setFilterVal] = useState(null);
    const [sortVal, setSortVal] = useState(null);

    const filterSelect = (e)=>{
        const val = e.currentTarget.getAttribute('value');
        e.currentTarget.className += ' sel';
        if(filterVal !== null && filterVal !== val){
            const lastTarget = document.getElementById(filterVal);
            lastTarget.className = 'sfilter uns';
        }
        setFilterVal(val);
    }

    const sortSelect = (e)=>{
        const val = e.currentTarget.getAttribute('value');
        e.currentTarget.className += ' sel';
        if(sortVal !== null && sortVal !== val){
            const lastTarget = document.getElementById(sortVal);
            lastTarget.className = 'sfilter uns';
        }
        setSortVal(val);
    }

    const resetAll = ()=>{
        if(filterVal !== null){
            const resetFilter = document.getElementById(filterVal);
            resetFilter.className = 'sfilter uns';
        }
        if(sortVal !== null){
            const resetSort = document.getElementById(sortVal);
            resetSort.className = 'sfilter uns';
        }
        setFilterVal(null);
        setSortVal(null);
    }

    return (
        <>
        <div className={`menu-bar ${ state === "show" ? "show" : ""}`} id="menu">
            <span id="menu-title">Sort and filter</span>
            <div className="sfilter-parent">
                <div className="sfilter-div">
                    <span>Filter by specialisation: </span>
                </div>
                <div className="menu-select-box">
                        <MenuContener_button func={filterSelect} value={"backend"} name={"Backend"}/>
                        <MenuContener_button func={filterSelect} value={"frontend"} name={"Frontend"}/>
                        <MenuContener_button func={filterSelect} value={"fullstack"} name={"Fullstack"}/>
                        <MenuContener_button func={filterSelect} value={"gamedev"} name={"Gamedev"}/>
                </div>
            </div>
            <div className="sfilter-parent">
                <div className="sfilter-div">
                    <span>Sort by type: </span>
                </div>
                <div className="menu-select-box">
                    <MenuContener_button func={sortSelect} value={"programming_langs"} name={"Programming languages"}/>
                    <MenuContener_button func={sortSelect} value={"db_tech"} name={"Database technologies"}/>
                    <MenuContener_button func={sortSelect} value={"os"} name={"Operating systems"}/>
                    <MenuContener_button func={sortSelect} value={"dev_platforms"} name={"Dev platforms"}/>
                    <MenuContener_button func={sortSelect} value={"frameworks"} name={"Frameworks"}/>
                </div>
            </div>
            <div className="sfilter-apply-div">
                <button onClick={resetAll} className="sfilter-control uns" id="sfilter-reset">Reset all</button>
                <button onClick={()=>{
                    const display = document.getElementById('info_tab');
                    if(display !== null || display == 'block')display.style.display = 'none';
                    if(sortVal === null && filterVal !== null){
                        navigate(`/sort/${filterVal}/`);
                    }else if(filterVal === null && sortVal !== null){
                        navigate(`/tech/${sortVal}/`);
                    }else if(filterVal !== null){
                        navigate(`/sort/${filterVal}/tech/${sortVal}`);
                    }else{
                        navigate(`/`);
                    }
                }} className="sfilter-control uns" id="sfilter-apply">Apply</button>
            </div>
        </div>
        </>
    )
}