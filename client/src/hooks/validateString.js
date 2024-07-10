const special_chars = {
    "#": "%23",
    "?": "%3F",
    "/": "%2F",
    ":": "%3A",
    ";": "%3B",
    "=": "%3D",
    "@": "%40",
    ",": "%2C",
    "\\": "%5C",
    ".": "%2E"
}
/**
 * Encodes and decodes special characters for URLs (both ways)
 * @param {string} str 
 * @returns {string} str with replaced special characters
 */
export default function validateString(str){
    for(const key of Object.keys(special_chars)){
        if(str.includes(key)){
            str = str.replaceAll(key, special_chars[key]);
            continue;
        }else if(str.includes(special_chars[key])){
            str = str.replaceAll(special_chars[key], key);
            continue;
        }
    }
    return str;
}
