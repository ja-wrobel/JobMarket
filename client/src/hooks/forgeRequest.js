const port = import.meta.env.VITE_SERVER_PORT || 8080;
const uri = import.meta.env.VITE_SERVER_URL || "http://localhost";
/**
 * Fetches data from server
 * @param {string} route ex. `/` || `/some_route/${variable}`
 * @param {string} METHOD like `POST` etc
 * @param {object|undefined} body_content = {foo: 'foo2'}
 * @returns {JSON|number} 
 * - `response.json();`
 * - IF (`response.ok === false`){
 * - `response.status`
 * - }
 */ 
export default async function forgeRequest(route, METHOD, body_content){

    const finalRequest = async (auth)=>{
        return await (fetch(`${uri}:${port}${route}`, {
            method: METHOD,
            headers: {
                'Content-Type': 'application/json',
                'Xsrf-Token': auth.token
            },
            mode: 'cors',
            body: body_content
        })
        .then(response => {
            if(!response.ok) return response.status;
    
            if(response.status === 200){
                return response.json();
            }
    
        }, reason => {
            return console.log(reason)
        }));
    }

    if(body_content !== undefined){
        body_content = JSON.stringify(body_content);
    }

    return await (fetch(`${uri}:${port}/auth${route}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors'
    })
    .then(response => {

        if(!response.ok) return response.status;
        if(response.status === 200){
            let auth_token = response.json();
            return auth_token;
        }
    })
    .then(async auth_token => {
        return await finalRequest(auth_token);
    }))
}

