import { useEffect, useState } from "react"

/**
 * 
 * @returns {string} `down` || `up`
 */
function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState();
    useEffect(() => {
        const app = document.getElementById('App');
        let lastScrollY = app.scrollTop;
        const updateScrollDirection = () => {
            const scrollY = app.scrollTop;
            const direction = scrollY > lastScrollY ? "down" : "up";
            if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
                setScrollDirection(direction);
            }
            lastScrollY = scrollY > 0 ? scrollY : 0;
        };
        app.addEventListener("scroll", updateScrollDirection); 
        return () => {
            app.removeEventListener("scroll", updateScrollDirection); 
        }
    }, [scrollDirection]);
  
    return scrollDirection;
};

    export default useScrollDirection