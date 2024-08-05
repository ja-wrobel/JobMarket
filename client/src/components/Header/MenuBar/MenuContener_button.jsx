export default function MenuContener_button(props){
    return(
        <>
        <button 
            onClick={props.func}
            id={props.value} 
            value={props.value} 
            className="sfilter uns">
            {props.name}
        </button>
        </>
    )
}