import { useEffect, useState } from "react";

let flag = false;
export default function useMenuControl(){
    const [menuHoverState, setMenuHoverState] = useState('');
    useEffect(()=>{
        const menu = document.getElementById('header-menu');
        const menuBtn = document.getElementById('menu-btn');
        const out = document.getElementById('list-div');
        const mouseOver = ()=>{
            setMenuHoverState('show');
        };
        const mouseLeave = ()=>{
            setMenuHoverState('');
        }
        const menuClick = ()=>{
            if(flag === true){
                setMenuHoverState('');
                flag = false;
                return;
            }
            setMenuHoverState('show');
            menu.removeEventListener('mouseover', mouseOver);
            menu.removeEventListener('mouseout', mouseLeave);
            flag = true;
            return;
        }
        const menuHide = ()=>{
            setMenuHoverState('');
            flag = false;
            return;
        }
        out.addEventListener('click', menuHide);
        menuBtn.addEventListener('click', menuClick);
        menu.addEventListener('mouseover', mouseOver);
        menu.addEventListener('mouseout', mouseLeave);
        return ()=>{
            out.removeEventListener('click', menuHide);
            menuBtn.removeEventListener('click', menuClick);
            menu.removeEventListener('mouseover', mouseOver);
            menu.removeEventListener('mouseout', mouseLeave);
        }
    }, [menuHoverState]);
    return menuHoverState;
}