function handleNavbar(){
    let anchorsNavbar = document.getElementsByClassName('topnav')[0].getElementsByTagName('a');

    for(let i=0;i<anchorsNavbar.length;i++){
        anchorsNavbar[i].addEventListener("click", function(){
            if(anchorsNavbar[i].className == "nav-item"){
                for(let j=0;j<anchorsNavbar.length;j++) if(j != i) 
                    anchorsNavbar[j].className = "nav-item"
                anchorsNavbar[i].className = "nav-item active";
                //console.log(anchorsNavbar[i].getAttribute('href'));
                let idName = anchorsNavbar[i].getAttribute('href');
                setActiveContent(idName);
            }
        })
    }
}

function setActiveContent(idName){
    let contentClass = document.getElementsByClassName('content');
    for(let i=0;i<contentClass.length;i++){
        if(('#' + contentClass[i].id) !== idName) {
            contentClass[i].className = 'content';
            contentClass[i].style.display = 'none';
        }
        else{
            contentClass[i].className = 'content active';
            contentClass[i].style.display = 'block';
        }
    }
}

function init(){
    document.getElementsByClassName('content active')[0].style.display = 'block';
    document.getElementsByClassName('map')[0].style.display = 'none';
    document.getElementsByClassName('pil-node')[0].style.display = 'none';
}

/* Main Function */
init();
handleNavbar();

