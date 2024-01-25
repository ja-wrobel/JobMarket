import { useEffect, useState } from "react"
import React from 'react'
import "../css/App.css";
import "../css/Footer.css";
import '../index.css';
import FooterText from "./FooterText.jsx";
const port = import.meta.env.SERVER_PORT || 8080;
const types = ['backend', 'frontend', 'fullstack', 'gamedev'];

function Footer(){
    const [content, setContent] = useState('');
    const [bool, setBool] = useState({});
    const [isUpdated, setIsUpdated] = useState(true);
    let flag = false;
    let oldestDate;

    const processDate = async (obj, boolObj) => {
      if(obj.date !== undefined){
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
        let DHMS = formatedDate.day*86400 + formatedDate.hour*3600 + formatedDate.minute*60 + formatedDate.second; //date in seconds
        if(flag !== false){
          let oldest_DHMS = oldestDate.day*86400 + oldestDate.hour*3600 + oldestDate.minute*60 + oldestDate.second; 
          if(DHMS < oldest_DHMS){
            oldestDate = formatedDate;
            let vDate = `Updated at:  ${oldestDate.year}-${oldestDate.month}-${oldestDate.day}  ${oldestDate.hour}:${oldestDate.minute}:${oldestDate.second}  `;
            return [vDate, boolObj];
          }else{
            let vDate = `Updated at:  ${oldestDate.year}-${oldestDate.month}-${oldestDate.day}  ${oldestDate.hour}:${oldestDate.minute}:${oldestDate.second}  `;
            return [vDate, boolObj];
          }
        }else{
          oldestDate = formatedDate;
          flag = true;
          return [null, boolObj]; //it's still NULL here bcs i need vDate only if each spec is updated
        }
      }else{
        boolObj[obj.type] = false;
        return [null, boolObj];
      }
    }

    const fetchData = async (spec) => {
      return await (await fetch(`http://localhost:${port}/upd_time/${spec}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          },
          mode: 'cors',
        })).json();
    }
    const loopData = async () => {
      const bool_obj = {};
      for(let type of types){
        const data = await fetchData(type);
        const [final_date_checked, this_type_bool_obj] = await processDate(data, bool_obj);
        setContent(final_date_checked);
        if(this_type_bool_obj[type] === false){
          setIsUpdated(false);
        }
        bool_obj[type] = this_type_bool_obj[type];
      }
      setBool(bool_obj);
      return [content, bool, isUpdated];
    }

    useEffect(()=>{
      loopData();
    }, [])
    return (
      <>
        <div id="Footer" className="Footer">
          <div id="footerText" className="footerText">
            <FooterText formBool={bool} lastUpdate={content} ifUpdated={isUpdated}/>
          </div>
        </div>
      </>
    )
  }



export default Footer



