import handleErrorByStatus from "../hooks/handleErrorByStatus.js"

export default function ErrorMessage(props){

    return(
        <>
        <p style={{fontSize: '1.5rem', marginBottom: '10rem'}}>HTTP ERROR {props.status}
            {handleErrorByStatus(props.status)}
        </p>
        <p>
        {
            props.status === 429 && '<<Try again in few seconds, if same issue appears - try in one hour>>'
        }
        {
            props.status === 401 && '<<Try to reload the page>>'
        }
        </p>
        </>
    )
}