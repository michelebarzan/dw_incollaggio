var utenti=[];
var stazioni;
var stazione;
var checkCodiceCambiaStazione=false;
var codiceCambiaStazione;
var nClickNumpadButtonPopupCambiaStazione;
var popupCodiceCambiaStazione=false;
var stopLogin = false;
var dw_mes_params;

window.addEventListener("load", async function(event)
{
    Swal.fire
    ({
        width:"100%",
        background:"transparent",
        title:"Login in corso...",
        html:'<i class="fad fa-spinner-third fa-spin fa-3x" style="color:white"></i>',
        allowOutsideClick:false,
        showCloseButton:false,
        showConfirmButton:true,
        allowEscapeKey:false,
        showCancelButton:false,
        confirmButtonText:"Interrompi",
        confirmButtonColor:"#DA6969",
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="white";document.body.classList.remove("swal2-height-auto")}
    }).then((result) => 
    {
        stopLogin = true;
    });

    startClock();

    dw_mes_params = await getDwMesParams();
    
    var tipo_login=await getSessionValue("tipo_login");

    if(tipo_login == "utente")
    {
        var nome_login=await getSessionValue("username");
        var id_utente=await getSessionValue("id_utente");

        var container=document.getElementById("loginUsersContainer");
        container.innerHTML = "";
    
        var item=document.createElement("button");
        item.setAttribute("class","login-user-item");
        item.setAttribute("onclick","location.reload()");
    
        var i=document.createElement("i");
        i.setAttribute("class","fad fa-users");
        item.appendChild(i);
        
        var span=document.createElement("span");
        span.innerHTML=nome_login;
        item.appendChild(span);
    
        var div=document.createElement("div");
        item.appendChild(div);
    
        container.appendChild(item);
    
        setTimeout(() =>
        {
            if(!stopLogin)
            {
                $.post("login.php",
                {
                    username:nome_login,
                    stazione:stazione.nome,
                    id_utente
                },
                function(response, status)
                {
                    if(status=="success")
                    {
                        if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                        {
                            Swal.fire
                            ({
                                icon: 'error',
                                title: 'Errore',
                                text: "Se il problema persiste contatta l' amministratore",
                                confirmButtonText:"Chiudi"
                            });
                            console.log(response);
                        }
                        else
                        {
                            window.location = stazione.pagina;
                        }
                    }
                    else
                    {
                        Swal.fire
                        ({
                            icon: 'error',
                            title: 'Errore',
                            text: "Se il problema persiste contatta l' amministratore",
                            confirmButtonText:"Chiudi"
                        });
                        console.log(status);
                    }
                });
            }
        }, 3000);
    }
    else
    {
        Swal.fire
        ({
            icon: 'error',
            title: 'Errore',
            text: "Login come squadra non consentito",
            confirmButtonText:"OK",
            onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="black";document.getElementById("swal2-content").style.color="black";document.body.classList.remove("swal2-height-auto")}
        }).then((result) => 
        {
            window.location = `${dw_mes_params.web_server_info.protocol}://${dw_mes_params.web_server_info.ip}:${dw_mes_params.web_server_info.port}/dw_mes_login/login.html?stazione=assemblaggio_byrb`;
        });
    }

    stazioni=await getAnagraficaStazioni();

    stazione=await getCookie("stazione");
    if(stazione=="")
        stazione=JSON.stringify(stazioni[0]);

    stazione=JSON.parse(stazione);

    document.getElementById("loginStazioneContainer").value=stazione.nome;
    document.getElementById("loginStazioneContainer").innerHTML=stazione.label;

    /*var container=document.getElementById("loginUsersContainer");
    utenti=await getUtentiStazioni();
    utenti.forEach(utente => 
    {
        var item=document.createElement("button");
        item.setAttribute("class","login-user-item");
        item.setAttribute("id","loginUserItem"+utente.id_utente);
        item.setAttribute("onclick","login('"+utente.id_utente+"')");

        var i=document.createElement("i");
        i.setAttribute("class","fad fa-user");
        item.appendChild(i);
        
        var span=document.createElement("span");
        span.innerHTML=utente.username;
        item.appendChild(span);

        var div=document.createElement("div");
        div.setAttribute("id","progressContainerLoginUserItem"+utente.id_utente);
        item.appendChild(div);

        container.appendChild(item);
    });*/
});
function getDwMesParams()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getDwMesParams.php",
        function(response, status)
        {
            if(status=="success")
                resolve(JSON.parse(response));
        });
    });
}
window.addEventListener("keydown", function(event)
{
    var keyCode=event.keyCode;
    switch (keyCode)
    {
        case 48:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("0",clickCambiaStazione)};break;
        case 49:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("1",clickCambiaStazione)};break;
        case 50:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("2",clickCambiaStazione)};break;
        case 51:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("3",clickCambiaStazione)};break;
        case 52:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("4",clickCambiaStazione)};break;
        case 53:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("5",clickCambiaStazione)};break;
        case 54:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("6",clickCambiaStazione)};break;
        case 55:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("7",clickCambiaStazione)};break;
        case 56:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("8",clickCambiaStazione)};break;
        case 57:if(popupCodiceCambiaStazione){clickNumpadButtonPopupCambiaStazione("9",clickCambiaStazione)};break;
        default:break;
    }
});
function startClock()
{
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('loginClockContainer').innerHTML = h + ":" + m + ":" + s;
    var t = setTimeout(startClock, 500);
}
function checkTime(i)
{
    if (i < 10) {i = "0" + i};
        return i;
}
function getAnagraficaStazioni()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getAnagraficaStazioni.php",
        function(response, status)
        {
            if(status=="success")
            {
                resolve(JSON.parse(response));
            }
            else
                reject({status});
        });
    });
}
/*function getUtentiStazioni()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getUtentiStazioni.php",
        function(response, status)
        {
            if(status=="success")
            {
                resolve(JSON.parse(response));
            }
            else
                reject({status});
        });
    });
}*/
/*async function login(id_utente)
{
    var button=document.getElementById("progressContainerLoginUserItem"+id_utente);

    button.innerHTML="";

    var utente=await getFirstObjByPropValue(utenti,"id_utente",id_utente);
    var username=utente.username;
    var nomeStazione=stazione.nome;

    button.innerHTML='<i class="fad fa-spinner-third fa-spin"></i>';
    $.post("login.php",
    {
        username,
        stazione:nomeStazione
    },
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                button.innerHTML='<i class="fal fa-exclamation-triangle" style="color:#DA6969">';
                Swal.fire
                ({
                    icon: 'error',
                    title: 'Errore',
                    text: "Se il problema persiste contatta l' amministratore",
                    confirmButtonText:"Chiudi"
                });
                console.log(response);
            }
            else
            {
                button.innerHTML='<i class="far fa-check-circle" style="color:#70B085"></i>';
                window.location = stazione.pagina;
            }
        }
        else
        {
            button.innerHTML='<i class="fal fa-exclamation-triangle" style="color:#DA6969">';
            Swal.fire
            ({
                icon: 'error',
                title: 'Errore',
                text: "Se il problema persiste contatta l' amministratore",
                confirmButtonText:"Chiudi"
            });
            console.log(status);
        }
    });
}*/
function getPopupCambiaStazione(callback)
{
    popupCodiceCambiaStazione=true;
    console.log(popupCodiceCambiaStazione);
    nClickNumpadButtonPopupCambiaStazione=0;
    codiceCambiaStazione="";

    var outerContainer=document.createElement("div");
    outerContainer.setAttribute("class","popup-cambia-stazione-outer-container");

    var title=document.createElement("span");
    title.setAttribute("class","popup-cambia-stazione-title");
    title.innerHTML="Inserisci il codice";
    outerContainer.appendChild(title);

    var fakeInputContainer=document.createElement("div");
    fakeInputContainer.setAttribute("class","popup-cambia-stazione-fake-input-container");
    var i=document.createElement("i");i.setAttribute("class","fal fa-circle");fakeInputContainer.appendChild(i);
    var i=document.createElement("i");i.setAttribute("class","fal fa-circle");fakeInputContainer.appendChild(i);
    var i=document.createElement("i");i.setAttribute("class","fal fa-circle");fakeInputContainer.appendChild(i);
    var i=document.createElement("i");i.setAttribute("class","fal fa-circle");fakeInputContainer.appendChild(i);
    outerContainer.appendChild(fakeInputContainer);

    var numpad=document.createElement("div");
    numpad.setAttribute("class","popup-cambia-stazione-numpad");
    var button=document.createElement("button");button.innerHTML="<span>1</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('1',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>2</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('2',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>3</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('3',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>4</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('4',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>5</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('5',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>6</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('6',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>7</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('7',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>8</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('8',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>9</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('9',"+callback+")");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>0</span>";button.setAttribute("onclick","clickNumpadButtonPopupCambiaStazione('0',"+callback+")");numpad.appendChild(button);
    outerContainer.appendChild(numpad);

    Swal.fire
    ({
        html:outerContainer.outerHTML,
        showCloseButton: false,
        showConfirmButton:false,
        showCancelButton:false,
        background:"#353535",
        onOpen : function()
                {
                    document.body.classList.remove("swal2-height-auto");
                    document.getElementsByClassName("swal2-content")[0].style.padding="0px";
                    document.getElementsByClassName("swal2-popup")[0].style.padding="0px";
                    document.getElementsByClassName("swal2-popup")[0].style.width="210px";
                    document.getElementsByClassName("swal2-content")[0].style.boxShadow="0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";
                    document.activeElement.blur()
                },
    }).then((result) => 
    {
        popupCodiceCambiaStazione=false;
    });
}
function clickNumpadButtonPopupCambiaStazione(n,callback)
{
    if(nClickNumpadButtonPopupCambiaStazione<5)
    {
        nClickNumpadButtonPopupCambiaStazione++;
        codiceCambiaStazione+=n;
        document.getElementsByClassName("popup-cambia-stazione-fake-input-container")[0].getElementsByTagName("i")[(nClickNumpadButtonPopupCambiaStazione-1)].className="fas fa-circle";
    }
    if(nClickNumpadButtonPopupCambiaStazione==4)
    {
        controllaCodiceCambiaStazione(callback);
    }
}
function controllaCodiceCambiaStazione(callback)
{
    $.post("controllaCodiceCambiaStazione.php",
    {
        codice:codiceCambiaStazione
    },
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                console.log(response)
                Swal.fire
                ({
                    icon: 'error',
                    title: 'Errore',
                    text: "Se il problema persiste contatta l' amministratore",
                    confirmButtonText:"Chiudi",
                    background:"#353535",
                });
            }
            else
            {
                if(response=="OK")
                {
                    Swal.close();
                    checkCodiceCambiaStazione=true;
                    callback();
                }
                else
                {
                    checkCodiceCambiaStazione=false;
                    getPopupCambiaStazione(callback);
                }
            }
        }
    });
}
function clickCambiaStazione()
{
    if(checkCodiceCambiaStazione==false)
        getPopupCambiaStazione(clickCambiaStazione);
    else
    {
        document.getElementById("loginStazioneContainer").focus();
        focused2="loginStazioneContainer";
        if(stazioni.length>0)
        {
            var nome=document.getElementById("loginStazioneContainer").value;
            var stazioneLocal=getFirstObjByPropValue(stazioni,"nome",nome);

            var index=stazioni.indexOf(stazioneLocal);
            var new_index=index-1;
            if(stazioni.indexOf(new_index)==-1)
                var new_index=index+1;
            if(new_index==stazioni.length)
                var new_index=0;
            var new_stazione=stazioni[new_index];
            stazione=new_stazione;

            document.getElementById("loginStazioneContainer").value=new_stazione.nome;
            document.getElementById("loginStazioneContainer").innerHTML=new_stazione.label;
            setCookie("stazione",JSON.stringify(new_stazione));
        }
    }
}