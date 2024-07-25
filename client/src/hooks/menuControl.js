import { useEffect, useState } from "react";
let isMenuOnScreen = false;
/**
 * Controls Menu's appearance on screen
 * @returns {string} `'show'` || `''`
 */
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
            if(isMenuOnScreen === true){
                setMenuHoverState('');
                isMenuOnScreen = false;
                return;
            }
            setMenuHoverState('show');
            menu.removeEventListener('mouseover', mouseOver);
            menu.removeEventListener('mouseout', mouseLeave);
            isMenuOnScreen = true;
            return;
        }
        const menuHide = ()=>{
            setMenuHoverState('');
            isMenuOnScreen = false;
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