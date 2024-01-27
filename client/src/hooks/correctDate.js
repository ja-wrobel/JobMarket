export default async function correctDate(date_obj){
    for(const key of Object.keys(date_obj)){
        if(date_obj[key] < 10){
            date_obj[key] = '0'+date_obj[key];
        }
    }
    return await date_obj;
}