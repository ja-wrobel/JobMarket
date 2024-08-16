import PythonAccess_button from "./PythonAccess_button";

export default function PythonAccessForm(props){
    return(
        <>
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
                    <button className="PyAccess-btn" onClick={props.callback} type="button">SEARCH</button>
                </label>
            </form>
        </>
    )
}