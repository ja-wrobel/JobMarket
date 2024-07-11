export default function SearchInput(){
    function escapeRegex(string) {
        return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    function search(){
        let inputVal = document.getElementById('search-input').value.toLowerCase();
        let list = document.getElementById('list');
        if(!list)return;
        if(list.children[0].getAttribute('accessKey') === null)return;
        for(const child of list.children){
            if(inputVal[0] !== "\""){
                if(child.getAttribute('accessKey').toLowerCase().includes(inputVal)){
                    child.hidden = false;
                }
                else{
                    child.hidden = true;
                }
            }
            else{
                let inputValEscaped = escapeRegex(inputVal.substring(1, (inputVal.length-1)));
                if(child.getAttribute('accessKey').toLowerCase().match(`^${inputValEscaped}$`)){
                    child.hidden = false;
                }else{
                    child.hidden = true;
                }
            }
        }
    }
    function clear(){
        const input = document.getElementById('search-input');
        input.value = '';
        search();
    }
    return(
        <>
        <input spellCheck="false" type="text" id="search-input" style={
            {   
                backgroundColor: 'rgba(25, 25, 112, 0.58)',
                borderRadius: '5px',
                padding: '3px',
                border: '2px groove rgb(35, 112, 255, 0.8)',
                color: 'rgb(20, 190, 240)',
                marginRight: '3px'
            }
        } placeholder='What you seek?.. "strict"' onChange={search}></input>
        <input type="button" value={'X'} style={
            {
                border: '2px groove rgb(35, 112, 255, 0.8)',
                borderRadius: '5px',
                padding: '3px 5px',
                backgroundColor: 'rgba(25, 25, 112, 0.58)',
                color: 'rgb(20, 190, 240)',
                cursor: 'pointer'
            }
        }onMouseEnter={(e)=>{e.target.style.border = '2px groove rgb(80, 186, 243, 0.8)';e.target.style.backgroundColor = 'rgb(34 81 173 / 58%)';}}
        onMouseLeave={(e)=>{e.target.style.border = '2px groove rgb(35, 112, 255, 0.8)';e.target.style.backgroundColor = 'rgba(25, 25, 112, 0.58)';}}
        onClick={clear}
        />
        </>
    );
}
