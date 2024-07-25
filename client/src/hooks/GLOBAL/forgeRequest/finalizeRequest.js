/**
 * Fetches desired data for authorized user
 * @param {object} userAuthenticated authorizationController
 * @param {string} route 
 * @param {string} METHOD 
 * @param {object|undefined} body_content 
 * @param {string} uri 
 * @param {string} port 
 * @returns {JSON|number|Response} `JSON` for `GET`, `number` = `response.status` in case of error, `Response` for methods like `POST`
 */
export default async function finalizeRequest(userAuthenticated, METHOD, body_content, uri, port){
    if(localStorage.getItem('auth_in_progress')){
        localStorage.removeItem('auth_in_progress');
    }
    if( !userAuthenticated.isValid() ){
        return 404;
    }
    return await (fetch(`${uri}:${port}${userAuthenticated.getPath()}`, {
        method: METHOD,
        headers: {
            'Content-Type': 'application/json',
            'Xsrf-Token': userAuthenticated.getToken(),
            'U_id': userAuthenticated.getID()
        },
        mode: 'cors',
        body: body_content
    })
    .then( response => {
        if(!response.ok) {
            if(response.status === 401) localStorage.clear(); // so even if something went wrong, user can get fine response after refresh
            return response.status;
        }

        if(response.status === 200){
            if(METHOD === 'POST' || METHOD === 'DELETE' || METHOD === 'PUT'){
                return response;
            }
            return response.json();
        }

    }));
}