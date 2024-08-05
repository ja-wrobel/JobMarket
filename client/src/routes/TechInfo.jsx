import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import validateString from "../hooks/validateString.js";
import "../css/TechInfo.css";
import forgeRequest from "../hooks/ReqHandler/forgeRequest.js";
import DOMPurify from 'dompurify';
import ErrorMessage from "../components/ErrorMessage.jsx";


function TechInfo(){
    const [info, setInfo] = useState([]);
    let {name} = useParams();
    let isRequestInProgress = false; // false allows useEffect to fire fetchData func, where it is set to true in order to stop useEffect from running fetchData multiple times because server is still processing previous request
    let isParameterValid = false;

    const setData = async () => {
        if(name === undefined){ return console.log('Something went wrong...'); }

        isRequestInProgress = true;
        const list_elements = document.getElementsByClassName('li_element');
        const loading_animation = document.getElementById('loading');
        // disable clicking new list element when another is still processed by server
        for(const e of list_elements){
            if(e.getAttribute("accesskey") === name){
                isParameterValid = true;
            }
            e.style.pointerEvents = 'none';
        }
        // user set name manually in url, second condition is necessary bcs after refresh li_element are not yet loaded at this point
        if(!isParameterValid && list_elements !== undefined){ 
            setInfo({first_p: "Invalid parameter..."});
            return console.log("Invalid parameter...")
        }

        loading_animation.className = 'load';
        loading_animation.style.display = 'block';

        name = validateString(name);

        await forgeRequest(`/more_info/${name}`, 'GET')
        .then(async data=>{
            // handle error
            if(typeof data === 'number'){
                loading_animation.className = '';

                for(const e of list_elements){e.style.pointerEvents = '';}

                loading_animation.style.display = 'none';
                setInfo(data);
                isRequestInProgress = false;
                return console.log('Something went wrong...');
            }
            // handle response.json
            name = validateString(name);
            loading_animation.className = '';
            loading_animation.style.display = 'none';

            for(const e of list_elements){e.style.pointerEvents = '';}

            if(data.second_p === ''){
                data.first_p = `Couldn't find article related to this subject...`;
                isRequestInProgress = false;
                setInfo(data);
                return;
            }
            isRequestInProgress = false;
            setInfo(data);
        });
    }
    useEffect(()=>{
        if(!isRequestInProgress){
            setData();
        }
    }, [name]);
    return (
        <>
        
            <div id="info_tab_title"><a dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(name)}} href={info.href} target="_blank"/></div>
            <div id="info_tab_content">
                <div id="loading"></div>
                {typeof info === 'number' && 
                    <ErrorMessage status={info}/>
                }
                <p dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(info.first_p)}}/>
                <p dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(info.second_p)}}/>
            </div>
            <div id="info_tab_table">
                <table dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(info.table)}}/>
            </div>
        
        </>
    )
}

export default TechInfo