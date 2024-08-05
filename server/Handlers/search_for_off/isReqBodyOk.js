/**
 * Checks if request body contains correct parameters as `backend`, `frontend` etc.
 * @param {string} reqBody parameter value
 * @returns {boolean} `true` - all good | `false` - malicous body specs
 */
function isReqBodyOk(reqBody){
    const acceptableSpecs = ["backend", "frontend", "fullstack", "gamedev", "all"];
    let isReqOk = false;
    for(let accSpec of acceptableSpecs){
        if(reqBody === accSpec){
            isReqOk = true;
            return isReqOk;
        }
    }
    return isReqOk;
}

module.exports = isReqBodyOk;