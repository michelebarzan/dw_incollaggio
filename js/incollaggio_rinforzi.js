var iframe;
var id_utente;
var interval;
var frequenza_aggiornamento_dati_linea;
var stazione;
var stazioni;
var intervalOverflowPdf1;
var intervalOverflowPdf2;
var pannello;

window.addEventListener("load", async function(event)
{
    startClock();

    id_utente=await getSessionValue("id_utente");

    frequenza_aggiornamento_dati_linea=await getParametro("frequenza_aggiornamento_dati_linea");
    frequenza_aggiornamento_dati_linea=parseInt(frequenza_aggiornamento_dati_linea);
    
    var nome_stazione=await getSessionValue("stazione");

    var stazioni=await getAnagraficaStazioni();

    stazione=getFirstObjByPropValue(stazioni,"nome",nome_stazione);

    svuotaLogoutStazione(stazione.id_stazione);

    document.getElementById("infoStazioneContainer").innerHTML=stazione.label;
    document.getElementById("infoStazioneContainer").setAttribute("nome",stazione.nome);
    document.getElementById("infoStazioneContainer").setAttribute("id_stazione",stazione.id_stazione);

    var username=await getSessionValue("username");
    document.getElementById("usernameContainer").innerHTML=username+'<i class="fad fa-user" style="margin-left:10px"></i>';

    currentDrawing="rinforzi";

    displayPannello();
    
    interval = setInterval(intervalFunctions, frequenza_aggiornamento_dati_linea);
});
async function displayPannello()
{
    if(drawingFullscreen)
        toggleDrawingFullscreen();
    document.getElementById("pdfContainer").innerHTML='<div class="inner-container-spinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>';
    document.getElementById("drawingInnerContainer").innerHTML='<div class="inner-container-spinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>';
    pannello=await getPannello();
    if(pannello!=null)
    {
        document.getElementById("labelOrdineDiProduzione").innerHTML="ODP : <b>"+pannello.nome_ordine_di_produzione+"</b>";
        document.getElementById("labelCodicePannello").innerHTML="PANNELLO : <b>"+pannello.codice_pannello+" ("+pannello.configurazione+")</b>";
        document.getElementById("labelNumeroCabina").innerHTML="CABINA : <b>"+pannello.numero_cabina+"</b>";
        document.getElementById("labelIdDistinta").innerHTML="# : <b>"+pannello.id_distinta+" ("+pannello.faccia+")</b>";
        document.getElementById("labelIdIncollaggio").innerHTML="ID INCOLLAGGIO : <b>"+pannello.id_incollaggio+"</b>";

        getFileProiettoreLaser(pannello.codice_pannello);
        getDrawingLamiera();
        getPdf(pannello.codice_pannello);
    }
    else
        clearPannello();
}
function getFileProiettoreLaser()
{
    var JSONpannello=JSON.stringify(pannello);
    $.get("getFileProiettoreLaser.php",{JSONpannello},
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
            }
            else
            {
                try
                {
                    var array_testo_programma=JSON.parse(response);
                    //console.log(array_testo_programma);
                } 
                catch (error)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                }
            }
        }
    });
}
function clearPannello()
{
    pannello=null;
    
    document.getElementById("labelOrdineDiProduzione").innerHTML="ODP :";
    document.getElementById("labelCodicePannello").innerHTML="PANNELLO :";
    document.getElementById("labelNumeroCabina").innerHTML="CABINA :";
    document.getElementById("labelIdDistinta").innerHTML="# :";
    document.getElementById("labelIdIncollaggio").innerHTML="ID INCOLLAGGIO :";

    document.getElementById("drawingInnerContainer").innerHTML="";
    drawing3DObj=null;
    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    $(".drawing-lamiera-legenda-button").remove();
    $(".drawing-lana-legenda-button").remove();

    var div=document.createElement("div");
    div.setAttribute("class","container-message-clear-pannello");
    var span=document.createElement("span");
    span.setAttribute("class","message-clear-pannello");
    span.innerHTML="NESSUN PANNELLO IN CODA";
    div.appendChild(span);
    document.getElementById("drawingInnerContainer").appendChild(div);
}
function getPannello()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getPannelloIncollaggioRinforzi.php",
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                }
                else
                {
                    try
                    {
                        var responseObj=JSON.parse(response);
                        resolve(responseObj);
                    }
                    catch (error)
                    {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve(null);
                    }
                }
            }
        });
    });
}
function intervalFunctions()
{
    checkPannello();
    checkLogoutStazione(stazione.id_stazione);
}
async function checkPannello()
{
    var pannelloCheck=await getPannello();
    if(pannelloCheck==null)
        clearPannello();
    else
    {
        if(pannello==null)
            displayPannello();
        else
        {
            if(pannelloCheck.id_incollaggio != pannello.id_incollaggio)
                displayPannello();
        }
    }
}
function getPannelloTaglioRinforzi()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getPannelloTaglioRinforzi.php",
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                }
                else
                {
                    try
                    {
                        var responseObj=JSON.parse(response);
                        resolve(responseObj);
                    }
                    catch (error)
                    {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve(null);
                    }
                }
            }
        });
    });
}
window.addEventListener("keydown", async function(event)
{
    var keyCode=event.keyCode;
    switch (keyCode) 
    {
        case 9:event.preventDefault();break;//TAB
        case 112:event.preventDefault();break;//F1
        case 113:event.preventDefault();break;//F2
        case 114:event.preventDefault();break;//F3
        case 115:event.preventDefault();break;//F4
        //case 116:event.preventDefault();break;//F5
        case 117:event.preventDefault();break;//F6
        case 118:event.preventDefault();break;//F7
        case 119:event.preventDefault();break;//F8
        case 120:event.preventDefault();break;//F9
        case 121:event.preventDefault();break;//F10
        //case 122:event.preventDefault();break;//F11
        case 123:event.preventDefault();break;//F12
        default:break;
    }
});
async function getPdf(fileName)
{
    var container=document.getElementById("pdfContainer");
    container.innerHTML="";
    iframe=null;
    iframe=document.createElement("iframe");
    //iframe.setAttribute("id","");
    //iframe.setAttribute("class","");
    iframe.setAttribute("onload","fixPdf(this)");
    var server_adress=await getServerValue("SERVER_ADDR");
    var server_port=await getServerValue("SERVER_PORT");
    iframe.setAttribute("src","http://"+server_adress+":"+server_port+"/dw_incollaggio_pdf/pdf.js/web/viewer.html?file=pdf/pannelli/"+fileName+".pdf");
    container.appendChild(iframe);
}
function fixPdf(iframe)
{
    var scrollbarIframe = document.createElement("link");
    scrollbarIframe.href = "css/scrollbarIframe.css"; 
    scrollbarIframe.rel = "stylesheet"; 
    scrollbarIframe.type = "text/css"; 
    iframe.contentWindow.document.head.appendChild(scrollbarIframe);

    iframe.contentWindow.document.body.style.backgroundColor="transparent";
    iframe.contentWindow.document.body.style.backgroundImage="none";

    iframe.contentWindow.document.getElementById("sidebarContainer").style.display="none";
    iframe.contentWindow.document.getElementById("secondaryToolbar").style.display="none";
    iframe.contentWindow.document.getElementsByClassName("toolbar")[0].style.display="none";

    iframe.contentWindow.document.getElementById("viewerContainer").style.top="0px";
    iframe.contentWindow.document.getElementById("viewerContainer").style.bottom="0px";
    iframe.contentWindow.document.getElementById("viewerContainer").style.left="0px";
    iframe.contentWindow.document.getElementById("viewerContainer").style.right="0px";

    iframe.contentWindow.document.getElementById("viewer").style.margin="10px";
    iframe.contentWindow.document.getElementById("viewer").style.width="calc(100% - 40px)";
    iframe.contentWindow.document.getElementById("viewer").style.height="calc(100% - 40px)";

    resetPdfZoom();

    /*setTimeout(() =>
    {
        console.clear();
    }, 500);*/
}
function resetPdfZoom()
{
    if(iframe!=null)
    {
        try {
            clearInterval(intervalOverflowPdf1);
        } catch (error) {}
        try {
            clearInterval(intervalOverflowPdf2);
        } catch (error) {}

        intervalOverflowPdf1 = setInterval(() => 
        {
            try {
                overflow=checkOverflow(iframe.contentWindow.document.getElementById("viewerContainer"));
            } catch (error) {
                overflow=true;
            }
            if(!overflow)
                pdfZoomin();
            else
            {
                clearInterval(intervalOverflowPdf1);
                intervalOverflowPdf2 = setInterval(() => 
                {
                    try {
                        overflow=checkOverflow(iframe.contentWindow.document.getElementById("viewerContainer"));
                    } catch (error) {
                        overflow=true;
                    }
                    if(overflow)
                        pdfZoomout();
                    else
                        clearInterval(intervalOverflowPdf2);
                }, 10);
            }
        }, 10);
    }
}
function checkOverflow(el)
{
    try {
        var curOverflow = el.style.overflow;

        if ( !curOverflow || curOverflow === "visible" )
            el.style.overflow = "hidden";

        var isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

        el.style.overflow = curOverflow;

        return isOverflowing;
    } catch (error) {
        return true;
    }
}
function pdfZoomin()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("zoomIn").click();
    } catch (error) {}
}
function pdfZoomout()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("zoomOut").click();
    } catch (error) {}
}
function pdfScrolltop()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollTop-=50;
    } catch (error) {}
}
function pdfScrolldown()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollTop+=50;
    } catch (error) {}
}
function pdfScrollleft()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollLeft-=50;
    } catch (error) {}
}
function pdfScrollright()
{
    try
    {
        if(iframe!=null)
            iframe.contentWindow.document.getElementById("viewerContainer").scrollLeft+=50;
    } catch (error) {}
}
function getParametro(nome)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getParametro.php",
        {
            nome
        },
        function(response, status)
        {
            if(status=="success")
            {
                resolve(response);
            }
            else
                reject({status});
        });
    });
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
function startClock()
{
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clockContainer').innerHTML = h + ":" + m + ":" + s;
    var t = setTimeout(startClock, 500);
}
function checkTime(i)
{
    if (i < 10) {i = "0" + i};
        return i;
}
function logout()
{
    $.get("logout.php",
    function(response, status)
    {
        window.location = 'login.html';
    });
}
function avanzaPannello()
{
    if(pannello!=null)
    {
        Swal.fire
        ({
            background:"#404040",
            title:"Vuoi avanzare il pannello?",
            width:"600px",
            text:"L'operazione simula la risposta del plc e potrebbe richiede un riavvio della linea",
            allowOutsideClick:false,
            //position:"top",
            showCloseButton:false,
            showConfirmButton:true,
            allowEscapeKey:false,
            showCancelButton:true,
            confirmButtonText:"AVANZA PANNELLO",
            cancelButtonText:"ANNULLA",
            onOpen : function()
                    {
                        document.getElementsByClassName("swal2-title")[0].style.fontWeight="normal";
                        document.getElementsByClassName("swal2-title")[0].style.color="#ebebeb";
                        document.getElementsByClassName("swal2-title")[0].style.fontSize="20px";

                        document.getElementById("swal2-content").style.marginTop="15px";
                        document.getElementById("swal2-content").style.color="#ccc";
                        document.getElementById("swal2-content").style.fontSize="14px";

                        document.getElementsByClassName("swal2-popup")[0].style.boxShadow="0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";
                        document.getElementsByClassName("swal2-popup")[0].style.border="2px solid black";
                    }
        }).then((result) =>
        {
            if (result.value)
            {
                Swal.fire
                ({
                    width:"100%",
                    background:"transparent",
                    title:"Caricamento in corso...",
                    html:'<i class="fad fa-spinner-third fa-spin fa-3x" style="color:white"></i>',
                    allowOutsideClick:false,
                    showCloseButton:false,
                    showConfirmButton:false,
                    allowEscapeKey:false,
                    showCancelButton:false,
                    onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";document.getElementsByClassName("swal2-title")[0].style.color="white";}
                });

                $.get("avanzaPannelloIncollaggioRinforzi.php",
                function(response, status)
                {
                    if(status=="success")
                    {
                        if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                        {
                            Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                            console.log(response);
                        }
                        else
                            Swal.close();
                    }
                });
            }
        });
    }
}