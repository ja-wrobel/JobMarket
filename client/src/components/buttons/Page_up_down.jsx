import { useEffect, useState } from "react";
import "../../css/Page_up_down.css";

export default function Page_up_down(){
    const [isDirectionUp, setIsDirectionUp] = useState(false);
    let scroll_position;
    const handleClick = ()=>{
        const app = document.getElementById('App');
        const app_height = (app.scrollHeight-600);
        if(isDirectionUp){
            app.scrollTop = 0;
        }else{
            app.scrollTop = app_height;
        }
    }
    useEffect(()=>{
        const app = document.getElementById('App');
        let app_height = (app.scrollHeight-600);
        const updateScrollPosition = ()=>{
            app_height = (app.scrollHeight-600);
            scroll_position = app.scrollTop;
            if(scroll_position > app_height/2) setIsDirectionUp(true);
            else setIsDirectionUp(false);
        }
        app.addEventListener('scroll', updateScrollPosition);
        return ()=>{
            app.removeEventListener('scroll', updateScrollPosition);
        }
    }, [scroll_position])
    return(
        <>
        <div onClick={handleClick} id="page_up_down">
            <img alt="down" className={
                `arrow ${isDirectionUp === true ? 'up' : 'down'}`
            } src="/arrow_down.png"/>
        </div>
        </>
    )
}