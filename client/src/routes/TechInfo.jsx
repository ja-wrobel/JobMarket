import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import validateString from "../hooks/validateString";
import "../css/TechInfo.css";
const port = import.meta.env.VITE_SERVER_PORT || 8080;
const uri = import.meta.env.VITE_SERVER_URL || "http://localhost";
let flag = false;

function TechInfo(){
    const [info, setInfo] = useState([]);
    let {name} = useParams();
    const fetchData = async () => {
        flag = true;
        const mask = document.getElementsByClassName('li_element');
        const loading_animation = document.getElementById('loading');
        const error_message = document.getElementById('error');
        for(const e of mask){e.style.pointerEvents = 'none';}
        loading_animation.className = 'load';
        loading_animation.style.display = 'block';
        name = await validateString(name);
        await fetch(`${uri}:${port}/more_info/${name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
          })            
            .then(response => {
                if(!response.ok){
                    loading_animation.className = '';
                    for(const e of mask){e.style.pointerEvents = '';}
                    loading_animation.style.display = 'none';
                    error_message.innerHTML = 'Something went wrong... (404 ERROR)';
                    return false;
                }
                return response.json()
            }, reason => {
                return console.log(reason)
            })
            .then(async data=>{
                if(!data){
                    flag = false;
                    return console.log('Something went wrong...');
                }
                name = await validateString(name);
                loading_animation.className = '';
                loading_animation.style.display = 'none';
                error_message.innerHTML = '';
                for(const e of mask){e.style.pointerEvents = '';}
                if(data.second_p === ''){
                    data.first_p = `Couldn't find article related to this subject...`;
                    flag = false;
                    setInfo(data);
                    return;
                }
                flag = false;
                setInfo(data);
            });
    }
    useEffect(()=>{
        if(!flag){
            fetchData();
        }
    }, [name]);
    return (
        <>
        <div>
            <div id="info_tab_title"><a dangerouslySetInnerHTML={{__html: name}} href={info.href} target="_blank"></a></div>
            <div id="info_tab_content">
                <div id="loading"></div>
                <p id="error"></p>
                <p dangerouslySetInnerHTML={{__html: info.first_p}}></p>
                <p dangerouslySetInnerHTML={{__html: info.second_p}}></p>
            </div>
            <div id="info_tab_table">
                <table dangerouslySetInnerHTML={{__html: info.table}}></table>
            </div>
        </div>
        </>
    )
}

export default TechInfo