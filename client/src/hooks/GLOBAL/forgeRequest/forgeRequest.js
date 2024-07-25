const port = import.meta.env.VITE_SERVER_PORT || 8080;
const uri = import.meta.env.VITE_SERVER_URL || "http://localhost";
import {authorizationControl} from "./authorizationController";
import authorizeUser from "./authorizeUser";
import finalizeRequest from "./finalizeRequest";

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

    if(body_content !== undefined){
        body_content = JSON.stringify(body_content);
    }

    const userAuthenticated = new authorizationControl();
    userAuthenticated.setPath(route);
    
    if(localStorage.getItem('user_id') !== null){
        userAuthenticated.setID(localStorage.getItem('user_id'));
    }

    if(localStorage.getItem('token') !== null){
        userAuthenticated.constructFromLocalData();
    }

    if(userAuthenticated.getID() === '' && localStorage.getItem('auth_in_progress') !== 'done'){

        const user = await authorizeUser(uri, port, route);
        if(!user){
            return 404;
        }
        userAuthenticated.merge(user);
        console.log(userAuthenticated);
        return await finalizeRequest(userAuthenticated, route, METHOD, body_content, uri, port);
    }else if(localStorage.getItem('auth_in_progress') !== 'done' && localStorage.getItem('user_id') !== null && !userAuthenticated.getIsTokenActive()){

        const user = await authorizeUser(uri, port, route, userAuthenticated);
        console.log(user);
        if(!user){
            return 404;
        }
        userAuthenticated.merge(user);
        return await finalizeRequest(userAuthenticated, route, METHOD, body_content, uri, port);
    }else{
        return await finalizeRequest(userAuthenticated, route, METHOD, body_content, uri, port);
    }

}

