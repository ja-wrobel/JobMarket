import "./PyAccessResult.css";

export default function PythonAccessResult(props){
    const result = props.result;
    return (
        <>
            <div id="PyAccess-title" style={{lineHeight: 'normal'}}>
                <h3 style={{margin: '1rem'}}>New entries:</h3>
            </div>
            <div id="PyAccess-result">
                <ul>
                    {result[0] === undefined || result[0].backend === undefined 
                    ?
                    result.map( (prop) => {
                        return(
                            <li className="li_element" id={prop.name} key={prop._id}>
                                <h2 style={{marginTop: '0.3em'}} value={prop.value}>{prop.name}&nbsp;-&nbsp;{prop.value}</h2>
                            </li>
                        );
                    })
                    :
                    result.map( (obj) => {
                        let JSXResult = [];
                        for( const key of Object.keys(obj)){

                            JSXResult.push(
                                <li key={key} style={{backgroundColor: 'rgb(0, 0, 0, 0)', border: '0'}}>
                                    <h2 style={{marginTop: '0.3em', color: 'dodgerblue'}}>{key}:</h2>
                                </li>
                            );

                            obj[key].map( (prop) => {
                                JSXResult.push( 
                                    <li className="li_element" id={prop.name} key={prop._id}>
                                        <h2 style={{marginTop: '0.3em'}} value={prop.value}>{prop.name}&nbsp;-&nbsp;{prop.value}</h2>
                                    </li>
                                );
                            });
                        }
                        return JSXResult;
                    })
                    }
                </ul>
            </div>
            <button style={{marginBottom: '3px'}} className="PyAccess-btn" onClick={props.onConfirm} type="button">Confirm</button>
        </>
    )
}