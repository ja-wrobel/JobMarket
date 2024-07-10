const port = import.meta.env.VITE_SERVER_PORT || 8080;
const uri = import.meta.env.VITE_SERVER_URL || "http://localhost";
/**
 * Fetches data from server
 * @method GET
 * @param {string} route ex. `/` || `/some_route/${variable}`
 * @returns response.json()
 */ 
export default async function getData(route){
    return await (await fetch(`${uri}:${port}${route}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        mode: 'cors',
      })
      .then(response => {
        if(!response.ok){
            return false;
        }
        return response.json()
    }, reason => {
        return console.log(reason)
    }));
}
