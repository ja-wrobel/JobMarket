export default function handleErrorByStatus(status){
    let error_message;
    switch(status){
        case 401:
            error_message = `${status}: Unauthorized`;
            break;
        case 404:
            error_message = `${status}: Not Found`;
            break;
        case 429:
            error_message = `${status}: Too Many Requests`;
            break;
        case 500:
            error_message = `${status}: Internal Server Error`;
            break;
        default:
            error_message = `${status}: Something went wrong...`;
    }
    return error_message;
}