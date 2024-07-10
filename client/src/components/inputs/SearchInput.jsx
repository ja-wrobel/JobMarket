export default function SearchInput(){
    function escapeRegex(string) {
        return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    function search(){
        let inputVal = document.getElementById('search-input').value.toLowerCase();
        let list = document.getElementById('list').children;
        if(list[0].getAttribute('accessKey') === null)return;
        for(const child of list){
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
    return(
        <>
        <input spellCheck="false" type="search" id="search-input" style={
            {   
                backgroundColor: '#19197094',
                borderRadius: '5px',
                padding: '3px',
                border: '2px groove rgb(35, 112, 255, 0.8)',
                color: 'rgb(20, 190, 240)'
            }
            } placeholder='What you seek?.. "strict"' onChange={search}></input>
        </>
    );
}
