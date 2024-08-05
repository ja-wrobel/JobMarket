import { useState } from "react";
import {useNavigate} from "react-router-dom";
import "./Menu.css";
import useMenuControl from "../../../hooks/Header/menuControl.js";
import MenuContener_button from "./MenuContener_button.jsx";
import validateString from "../../../hooks/validateString.js";

export default function MenuContener(){

    const navigate = useNavigate();
    const state = useMenuControl();

    const [specVal, setSpecVal] = useState(null);
    const [typeVal, setTypeVal] = useState(null);

    const specSelect = (e)=>{
        const val = e.currentTarget.getAttribute('value');
        e.currentTarget.className += ' sel';
        if(specVal !== null && specVal !== val){
            const lastTarget = document.getElementById(specVal);
            lastTarget.className = 'sfilter uns';
        }
        setSpecVal(val);
    }

    const sortSelect = (e)=>{
        const val = e.currentTarget.getAttribute('value');
        e.currentTarget.className += ' sel';
        if(typeVal !== null && typeVal !== val){
            const lastTarget = document.getElementById(typeVal);
            lastTarget.className = 'sfilter uns';
        }
        setTypeVal(val);
    }

    const resetAll = ()=>{
        if(specVal !== null){
            const resetSpec = document.getElementById(specVal);
            resetSpec.className = 'sfilter uns';
        }
        if(typeVal !== null){
            const resetSort = document.getElementById(typeVal);
            resetSort.className = 'sfilter uns';
        }
        setSpecVal(null);
        setTypeVal(null);
    }
    /**
     * 
     * @param {string} specRoute `/sort/:key`
     * @param {string} typeRoute `/tech/:key`
     */
    const smartNavigate = (specRoute, typeRoute)=>{
        const infoTabHTML = document.getElementById('info_tab');
        if(infoTabHTML.accessKey !== ''){
            let tech_name = validateString(infoTabHTML.accessKey);
            navigate(`${specRoute}${typeRoute}/_info/${tech_name}`);
        }
        else{navigate(`${specRoute}${typeRoute}/`);}
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
                        <MenuContener_button func={specSelect} value={"backend"} name={"Backend"}/>
                        <MenuContener_button func={specSelect} value={"frontend"} name={"Frontend"}/>
                        <MenuContener_button func={specSelect} value={"fullstack"} name={"Fullstack"}/>
                        <MenuContener_button func={specSelect} value={"gamedev"} name={"Gamedev"}/>
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
                    if(typeVal === null && specVal !== null){
                        smartNavigate(`/sort/${specVal}`, ``);
                    }else if(specVal === null && typeVal !== null){
                        smartNavigate(``, `/tech/${typeVal}`);
                    }else if(specVal !== null){
                        smartNavigate(`/sort/${specVal}`, `/tech/${typeVal}`);
                    }else{
                        smartNavigate(``, ``);
                    }
                }} className="sfilter-control uns" id="sfilter-apply">Apply</button>
            </div>
        </div>
        </>
    )
}