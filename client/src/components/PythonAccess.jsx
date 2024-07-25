import useWindowControl from "../hooks/windowControl";
import "../css/PyAccess.css";
import PythonAccess_button from "./buttons/PythonAccess_button";
import forgeRequest from "../hooks/GLOBAL/forgeRequest/forgeRequest";

function PythonAccess(props){
    const windowControler = useWindowControl();
    const warning = document.getElementById('PyAccess-validate');
    
    async function searchButton(){
        const form = document.getElementById('PyAccess-form');
        if(form.specs.value === ''){
            warning.innerHTML = "You really should choose specialisation...";
            warning.style.display = "block";
            return 0;
        }
        warning.innerHTML = '';
        const req_body = {
            specs: form.specs.value
        };
        const mask = document.getElementById('mask');
        mask.style.display = 'block';
        warning.className = 'load';
        warning.style.display = 'block';
        
        await forgeRequest(`/search_for_off`, 'POST', req_body)
        .then((response) => {
            if(!response.ok){
                warning.innerHTML = `Something went wrong... (HTTP Error: ${response.status===429 ? '429) - Too Many Requests - try again in one hour' : `${response.status})`}`;
                warning.className = '';
                mask.style.display = 'none';
                return;
            }
            if(response.status === 200){
                warning.className = '';
                warning.style.display = 'none';
                mask.style.display = 'none';
                return window.location.reload();
            }
        })
        .catch(e => {
            warning.innerHTML = `Something went wrong... (HTTP Error: ${e})`;
            warning.className = '';
            mask.style.display = 'none';
            return console.log(e);
        });
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
        warning.style.fontSize = 'larger';
    }
    return (
        <>
            <div className={`PythonAccess ${windowControler}`} id='PythonAccess'>
                <div id="PyAccess-close" className="uns">
                    <button className="PyAccess-btn" onClick={closeButton} id="PyAccess-close-btn">X</button>
                </div>
                <div id="PyAccess-validate">
                </div>
                <div className='PyAccessForm'>
                    <form id="PyAccess-form">
                        <div id="PyAccess-title">
                            <h3>Choose specialisation</h3>
                        </div>
                        {props.backend === false &&
                            <PythonAccess_button name={"Back-end Developer"} value={"backend"}/>
                        }
                        {props.frontend === false &&
                            <PythonAccess_button name={"Front-end Developer"} value={"frontend"}/>
                        }
                        {props.fullstack === false &&
                            <PythonAccess_button name={"Full-stack Developer"} value={"fullstack"}/>
                        }
                        {props.gamedev === false &&
                            <PythonAccess_button name={"Game Developer"} value={"gamedev"}/>
                        }
                        {props.backend === false && props.frontend === false && props.fullstack === false && props.gamedev === false &&
                            <PythonAccess_button name={"All of above"} value={"all"}/>
                        }
                        <label className="PyAccess-opt uns" id="btn-opt">
                            <button className="PyAccess-btn" onClick={searchButton} type="button">SEARCH</button>
                        </label>
                    </form>
                </div>
            </div>
        </>
    )
}


export default PythonAccess