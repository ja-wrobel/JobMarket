import { authorizationControl, cryptoControl } from "./authorizationController";
/**
 * Fetches new token
 * @param {string} uri 
 * @param {string} port 
 * @param {string} route 
 * @param {authorizationControl} userAuthenticated 
 */
export default async function authorizeUser(uri, port, route, userAuthenticated){

    if(localStorage.getItem('auth_in_progress') === 'true'){
        const user = new authorizationControl();
        return await authorizationControl.waitForAuthorization(user, route);
    }
    let token = import.meta.env.VITE_AUTH_TOKEN;
    const crypt = new cryptoControl(1000, 64, 16, route);
    token = crypt.encrypt(token, true);

    localStorage.setItem('auth_in_progress', 'true');

    return await (fetch(`${uri}:${port}/auth`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'U_id': `${userAuthenticated !== undefined ? userAuthenticated.getID() : ''}`,
            'Xsrf-Token': token
        },
        mode: 'cors'
    })
    .then(response => {
        if(!response.ok) return response.status;

        if(response.status === 200){
            let auth_json = response.json();
            return auth_json;
        }
    })
    .then(auth_json => {
        const user = new authorizationControl(auth_json.user_id, auth_json.token, new Date(auth_json.date), new Date(auth_json.created_at), route, true);
        user.setLocalData();
        localStorage.setItem('auth_in_progress', 'done');
        return user;
    }))

}