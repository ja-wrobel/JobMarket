import { useEffect, useState } from "react"
import React from 'react'
import "../css/Footer.css";
import '../index.css';
import FooterText from "./FooterText.jsx";
import correctDate from "../hooks/correctDate.js";
import forgeRequest from "../hooks/GLOBAL/forgeRequest/forgeRequest.js";

const types = ['backend', 'frontend', 'fullstack', 'gamedev'];

function Footer(){
    const [content, setContent] = useState('');
    const [bool, setBool] = useState({});
    const [isUpdated, setIsUpdated] = useState(true);
    let isFirstTypeChecked = false;
    let final_date_as_string, oldest_DHMS;

    const processDate = async (obj, boolObj) => {
        if(obj.date === undefined){
            boolObj[obj.type] = false;
            return [null, boolObj];
        }
        let date = new Date(obj.date);
        boolObj[obj.type] = true;
        const formatedDate = {
            year: date.getFullYear(),
            month: date.getMonth()+1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds()
        }
        if(!isFirstTypeChecked){
            oldest_DHMS = (
                Number(formatedDate.day)*86400 + Number(formatedDate.hour)*3600 + 
                Number(formatedDate.minute)*60 + Number(formatedDate.second)
            );
            correctDate(formatedDate);
            final_date_as_string = `Updated at:  ${formatedDate.year}-${formatedDate.month}-${formatedDate.day}  ${formatedDate.hour}:${formatedDate.minute}:${formatedDate.second}  `;
            isFirstTypeChecked = true;
            return [null, boolObj]; //it's still NULL here bcs i need final_date_as_string only if each spec is updated
        }

        let current_DHMS = (
            Number(formatedDate.day)*86400 + Number(formatedDate.hour)*3600 + 
            Number(formatedDate.minute)*60 + Number(formatedDate.second)
        ); //date in seconds

        if(current_DHMS < oldest_DHMS){
            oldest_DHMS = (
                Number(formatedDate.day)*86400 + Number(formatedDate.hour)*3600 + 
                Number(formatedDate.minute)*60 + Number(formatedDate.second)
            ); 
            correctDate(formatedDate);
            final_date_as_string = `Updated at:  ${formatedDate.year}-${formatedDate.month}-${formatedDate.day}  ${formatedDate.hour}:${formatedDate.minute}:${formatedDate.second}  `;
            return [final_date_as_string, boolObj];
        }
        return [final_date_as_string, boolObj];
    }

    const fetchAndHandleData = async () => {
        const bool_obj = {};
        let final_date_checked, this_type_bool_obj;
        const data = await forgeRequest(`/upd_time/`, 'GET');
        const data_length = data.length;
        if(typeof data === 'number'){
            setContent(`Something went wrong... (HTTP Error: ${data})`);
            setBool({backend: true, frontend: true, fullstack: true, gamedev: true});
            setIsUpdated(true);
            return [content, bool, isUpdated];
        }
        for(let i=0; i<data_length; ++i){
            for(const type of types){
                if(data[i].type === type){
                    [final_date_checked, this_type_bool_obj] = await processDate(data[i], bool_obj);
                    bool_obj[type] = this_type_bool_obj[type];
                    setContent(final_date_checked);
                }
            }
        }
        for(const type of types){
            if(bool_obj[type] === false || bool_obj[type] === undefined){
                setIsUpdated(false);
                bool_obj[type] = false;
            }
        }
        setBool(bool_obj);
        return [content, bool, isUpdated];
    }

    useEffect(()=>{
        fetchAndHandleData();
    }, [])

    return (
    <>
        <div id="Footer" className="Footer">
            <div id="footerText" className="footerText">
                <FooterText formBool={bool} lastUpdate={content} isUpdated={isUpdated}/>
            </div>
        </div>
    </>
    )
}



export default Footer



