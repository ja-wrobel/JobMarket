import { useEffect, useState } from "react"
import React from 'react'
import "./Footer.css";
import '../../index.css';
import FooterText from "./FooterText.jsx";
import processDate from "../../hooks/Footer/processDate.js";
import forgeRequest from "../../hooks/ReqHandler/forgeRequest.js";
import handleErrorByStatus from "../../hooks/handleErrorByStatus.js";

const types = ['backend', 'frontend', 'fullstack', 'gamedev'];

function Footer(){
    const [content, setContent] = useState('');
    const [isTypeUpdated, setIsTypeUpdated] = useState({});
    const [isUpdated, setIsUpdated] = useState(true);

    const fetchAndHandleData = async () => {
        const bool_obj = {};
        let final_date_checked, this_type_bool_obj;
        const data = await forgeRequest(`/upd_time/`, 'GET');
        const data_length = data.length;
        // handle error
        if(typeof data === 'number'){
            setContent(`(HTTP Error ${ handleErrorByStatus(data) })`);
            setIsTypeUpdated({backend: true, frontend: true, fullstack: true, gamedev: true});
            setIsUpdated(true);
            return [content, isTypeUpdated, isUpdated];
        }
        // find which types are updated and which update is oldest, set content to show oldest update time
        for(let i=0; i<data_length; ++i){
            for(const type of types){
                if(data[i].type === type){
                    [final_date_checked, this_type_bool_obj] = await processDate(data[i], bool_obj);
                    bool_obj[type] = this_type_bool_obj[type];
                    setContent(final_date_checked);
                }
            }
        }
        // check if all types are updated, if not - PythonAccess will be rendered by FooterText component
        for(const type of types){
            if(bool_obj[type] === false || bool_obj[type] === undefined){
                setIsUpdated(false);
                bool_obj[type] = false;
            }
        }
        setIsTypeUpdated(bool_obj);
        return [content, isTypeUpdated, isUpdated];
    }

    useEffect(()=>{
        fetchAndHandleData();
    }, [])

    return (
    <>
        <div id="Footer" className="Footer">
            <div id="footerText" className="footerText">
                <FooterText formBool={isTypeUpdated} lastUpdate={content} isUpdated={isUpdated}/>
            </div>
        </div>
    </>
    )
}



export default Footer



