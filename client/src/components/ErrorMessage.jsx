export default function ErrorMessage(props){
    return(
        <>
        <p style={{fontSize: '1.5rem', marginBottom: '10rem'}}>HTTP ERROR {props.status}
            {
                props.status === 429 ? ': Too Many Requests' : ': Something went wrong...'
            }
        </p>
        <p>
        {
            props.status === 429 && '<<Try again in few seconds, if same issue appears - try in one hour>>'
        }
        </p>
        </>
    )
}