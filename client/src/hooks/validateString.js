const special_chars = {
    "#": "%23",
    "?": "%22",
    "/": "%2F",
    ":": "%3A",
    ";": "%3B",
    "=": "%3D",
    "@": "%40",
    ",": "%2C"
}
export default function validateString(str){
    for(const key of Object.keys(special_chars)){
        if(str.includes(key)){
            str = str.replace(key, special_chars[key]);
            continue;
        }else if(str.includes(special_chars[key])){
            str = str.replace(special_chars[key], key);
            continue;
        }
    }
    return str;
}
