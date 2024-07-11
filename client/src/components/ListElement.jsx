import { useNavigate } from "react-router-dom";

export default function ListElement(props){
    const navigate = useNavigate();
    return(
        <>
        <li 
            accessKey={props.entry.name}
            className={`li_element`}
            onClick={()=>{
                navigate(props.route);
                const display = document.getElementById('info_tab');
                display.accessKey = props.entry.name;
                if(display !== null)display.style.display = 'block';
            }} 
            id={props.entry.name} 
        >
            <h2 value={props.entry.value}>{props.entry.name}&nbsp;-&nbsp;{props.entry.value}</h2>
            <p id="p_info">Click for more info</p>
        </li>
        </>
    )
}