import { useState } from "react";
import useWindowControl from "../../hooks/PythonAccess/windowControl.js";
import "./PyAccess.css";
import forgeRequest from "../../hooks/ReqHandler/forgeRequest.js";
import handleErrorByStatus from "../../hooks/handleErrorByStatus.js";
import PythonAccessForm from "./PythonAccessForm.jsx";
import PythonAccessResult from "./PythonAccessResult.jsx";

function PythonAccess(props){
    const windowControler = useWindowControl();
    const [callbackResult, setCallbackResult] = useState(undefined);
    const warning = document.getElementById('PyAccess-validate');
    
    async function searchButton(){
        const form = document.getElementById('PyAccess-form');
        // in case user didn't choose type
        if(form.specs.value === ''){
            warning.innerHTML = "You really should choose specialisation...";
            warning.style.display = "block";
            return 0;
        }
        // clears innerhtml so it will be only circle spinning, not text 
        warning.innerHTML = '';
        // disable all actions while server is processing request. Show loading animation
        const mask = document.getElementById('mask');
        mask.style.display = 'block';
        warning.className = 'load';
        warning.style.display = 'block';
        
        const req_body = {
            specs: form.specs.value
        };
        await forgeRequest(`/search_for_off`, 'POST', req_body)
        .then((response) => {
            if( typeof response === 'number' ){
                warning.innerHTML = `(HTTP Error ${response===429 ? ': 429) - Too Many Requests - try again in one hour' : handleErrorByStatus(response) }`;
                warning.className = '';
                mask.style.display = 'none';
                return;
            }
            warning.className = '';
            warning.style.display = 'none';
            mask.style.display = 'none';
            setCallbackResult(response);
        })
    }

    function closeButton(){
        document.getElementById('PythonAccess').className = `PythonAccess ${windowControler}`;
        let radio = document.getElementsByClassName('PyAccess-radio');
        for(let i = 0;i<radio.length;++i){
            if(radio[i].checked === true){
                radio[i].checked = false;
                break;
            }
        }
    }

    return (
        <>
            <div className={`PythonAccess ${windowControler}`} id='PythonAccess'>
                <div id="PyAccess-close" className="uns">
                    <button className="PyAccess-btn" onClick={closeButton} id="PyAccess-close-btn">X</button>
                </div>
                <div id="PyAccess-validate">
                </div>
                <div className='PyAccessDiv' id="PyAccessDiv">
                    { callbackResult === undefined && 
                        <PythonAccessForm 
                            backend={props.backend}
                            frontend={props.frontend}
                            fullstack={props.fullstack}
                            gamedev={props.gamedev}
                            callback={searchButton}
                        />
                    }
                    { callbackResult !== undefined &&
                        <PythonAccessResult
                            result={callbackResult}
                            onConfirm={() => window.location.reload()}
                        />
                    }
                </div>
            </div>
        </>
    )
}


export default PythonAccess