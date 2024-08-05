export default function PythonAccess_button(props){
    return (
        <>
        <label className="PyAccess-opt uns">
            <input type="radio" className="PyAccess-radio" name="specs" value={props.value}/>
            <div className="srch-d2"><div className="srch-d">{props.name}</div></div>
        </label>
        </>
    )
}