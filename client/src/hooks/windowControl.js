import { useState, useEffect } from "react";

function useWindowControl(){
    const [windowControler, setWindowControler] = useState('hidden');
    const secondRoot = document.getElementById('pyAccess').innerHTML;
    useEffect(()=>{
        const warning = document.getElementById('PyAccess-validate');
        warning.innerHTML = "";
        warning.style.display = null;
        warning.style.color = null;
        const pyAccessBtn = document.getElementById('PyAccess-footer-btn');
        const pyAccessDiv = document.getElementById('PythonAccess');
        const pyAccessCloseBtn = document.getElementById('PyAccess-close-btn');
        const updateWindowControler = ()=>{
            if(windowControler === 'hidden'){
                setWindowControler('show');
            }
            else{
                setWindowControler('hidden');
            }
            pyAccessDiv.className = `PythonAccess ${windowControler}`;
        }
        pyAccessBtn.addEventListener("click", updateWindowControler);
        pyAccessCloseBtn.addEventListener("click", updateWindowControler); 
        return () => {
            pyAccessCloseBtn.removeEventListener("click", updateWindowControler); 
            pyAccessBtn.removeEventListener("click", updateWindowControler);
        }
    }, [windowControler, secondRoot])
    return windowControler;
}

export default useWindowControl