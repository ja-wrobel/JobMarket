import correctDate from "../correctDate";
let isFirstTypeChecked = false;
let final_date_as_string, oldest_DHMS;

/**
 * Validates whether type is updated and sets string message if so. Keeps oldest update time and message in variable, so it will return message and date of oldest update.
 * @param {object} obj needs property: `type`: `string` and optional property `date`: `Date`
 * @param {object} boolObj sets property named after `type` from `obj` to either `true` (when date in obj is set) or `false`
 * @returns {Promise<[string,object]>} `string` contains message with date of last update, `object` contains properties named after `obj.type` with `boolean` value
 */
export default async function processDate(obj, boolObj){
    if(obj.date === undefined){
        boolObj[obj.type] = false;
        return [null, boolObj];
    }
    let date = new Date(obj.date);
    boolObj[obj.type] = true;
    const formatedDate = {
        year: date.getFullYear(),
        month: date.getMonth()+1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds()
    }
    if(!isFirstTypeChecked){
        oldest_DHMS = (
            Number(formatedDate.day)*86400 + Number(formatedDate.hour)*3600 + 
            Number(formatedDate.minute)*60 + Number(formatedDate.second)
        );
        correctDate(formatedDate);
        final_date_as_string = `Updated at:  ${formatedDate.year}-${formatedDate.month}-${formatedDate.day}  ${formatedDate.hour}:${formatedDate.minute}:${formatedDate.second}  `;
        isFirstTypeChecked = true;
        return [null, boolObj]; //it's still NULL here bcs i need final_date_as_string only if each spec is updated
    }

    let current_DHMS = (
        Number(formatedDate.day)*86400 + Number(formatedDate.hour)*3600 + 
        Number(formatedDate.minute)*60 + Number(formatedDate.second)
    ); //date in seconds

    if(current_DHMS < oldest_DHMS){
        oldest_DHMS = (
            Number(formatedDate.day)*86400 + Number(formatedDate.hour)*3600 + 
            Number(formatedDate.minute)*60 + Number(formatedDate.second)
        ); 
        correctDate(formatedDate);
        final_date_as_string = `Updated at:  ${formatedDate.year}-${formatedDate.month}-${formatedDate.day}  ${formatedDate.hour}:${formatedDate.minute}:${formatedDate.second}  `;
        return [final_date_as_string, boolObj];
    }
    return [final_date_as_string, boolObj];
}