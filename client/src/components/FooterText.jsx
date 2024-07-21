import React, { useEffect } from "react";
import exp from "../main";
import PythonAccess from "./PythonAccess";

export default function FooterText(props){
    const boolArr = props.formBool;
    useEffect(()=>{
        const footer_height = document.getElementById('footerText').offsetHeight;
        const this_component = document.getElementById('page_up_down');
        this_component.style.bottom = `${(footer_height+10)}px`;
        if(boolArr.backend === false || boolArr.frontend === false || boolArr.fullstack === false || boolArr.gamedev === false){
            exp.root2.render(
                <React.StrictMode>
                    <PythonAccess 
                        backend={boolArr.backend} 
                        frontend={boolArr.frontend} 
                        fullstack={boolArr.fullstack} 
                        gamedev={boolArr.gamedev}
                    />
                </React.StrictMode>
            );
        }
    }, [boolArr])
    return(
        <>
        {props.isUpdated === true &&
        props.lastUpdate}
        {props.isUpdated === false &&
        <div>
            <span>Not every specialisation has been updated in last 24 hours...</span>
            <button className="PyAccess-btn uns" id="PyAccess-footer-btn">
                Search for updates
            </button>
        </div>  
        }
        </>
    )
}