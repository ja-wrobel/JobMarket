export default function handleErrorByStatus(status){
    let error_message;
    switch(status){
        case 401:
            error_message = ': Unauthorized';
            break;
        case 404:
            error_message = ': Not Found';
            break;
        case 429:
            error_message = ': Too Many Requests';
            break;
        case 500:
            error_message = ': Internal Server Error';
            break;
        default:
            error_message = ': Something went wrong...';
    }
    return error_message;
}