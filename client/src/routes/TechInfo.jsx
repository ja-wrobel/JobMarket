import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import validateString from "../hooks/validateString";
import "../css/TechInfo.css";
import getData from "../hooks/getData";
import DOMPurify from 'dompurify';
import ErrorMessage from "../components/ErrorMessage";

let isRequestInProgress = false; // false allows useEffect to fire fetchData func, where it is set to true in order to stop useEffect from running fetchData multiple times because server is still processing previous request

function TechInfo(){
    const [info, setInfo] = useState([]);
    let {name} = useParams();
    const setData = async () => {
        isRequestInProgress = true;
        const mask = document.getElementsByClassName('li_element');
        const loading_animation = document.getElementById('loading');
        for(const e of mask){e.style.pointerEvents = 'none';}
        loading_animation.className = 'load';
        loading_animation.style.display = 'block';
        name = validateString(name);

        await getData(`/more_info/${name}`)
            .then(async data=>{
                if(typeof data === 'number'){
                    loading_animation.className = '';
                    for(const e of mask){e.style.pointerEvents = '';}
                    loading_animation.style.display = 'none';
                    setInfo(data);
                    isRequestInProgress = false;
                    return console.log('Something went wrong...');
                }
                name = validateString(name);
                loading_animation.className = '';
                loading_animation.style.display = 'none';
                for(const e of mask){e.style.pointerEvents = '';}
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