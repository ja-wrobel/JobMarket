const port = import.meta.env.VITE_SERVER_PORT || 8080;
const uri = import.meta.env.VITE_SERVER_URL || "http://localhost";
import {authorizationControl} from "./Controllers/authorizationController";
import authorizeRequest from "./authorizeRequest";
import finalizeRequest from "./finalizeRequest";

/**
 * Fetches data from server
 * @param {string} route ex. `/` || `/some_route/${variable}`
 * @param {string} METHOD like `POST` etc
 * @param {object|undefined} body_content = {foo: 'foo2'}
 * @returns {JSON|number|Response} 
 * - `response.json();`
 * - IF (`response.ok === false`){
 * - `response.status`
 * - }
 * - just a Response for `POST` method and alike
 */ 
export default async function forgeRequest(route, METHOD, body_content){

    if(body_content !== undefined){
        body_content = JSON.stringify(body_content);
    }

    const userAuthenticated = new authorizationControl();
    userAuthenticated.setPath(route);

    if(localStorage.getItem('user_id') !== null){
        userAuthenticated.constructFromLocalData();
    }
    const isActive = userAuthenticated.getIsTokenActive();

    if(userAuthenticated.getID() === '' && localStorage.getItem('auth_in_progress') !== 'done' && !isActive){

        const user = await authorizeRequest(uri, port, route);
        if(!user){
            return 404;
        }
        userAuthenticated.merge(user);
        return await finalizeRequest(userAuthenticated, METHOD, body_content, uri, port);
    }
    else if(userAuthenticated.getID() !== '' && localStorage.getItem('auth_in_progress') !== 'done' && !isActive){

        const user = await authorizeRequest(uri, port, route, userAuthenticated);
        if(!user){
            return 404;
        }
        userAuthenticated.merge(user);
        return await finalizeRequest(userAuthenticated, METHOD, body_content, uri, port);
    }
    else{
        return await finalizeRequest(userAuthenticated, METHOD, body_content, uri, port);
    }

}

