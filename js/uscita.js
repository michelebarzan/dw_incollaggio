var iframe;
var id_utente;
var interval;
var frequenza_aggiornamento_dati_linea;
var stazione;
var stazioni;
var intervalOverflowPdf1;
var intervalOverflowPdf2;
var pannello;
var bancale;

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

    currentDrawing="lana";
    document.getElementById("labelToggleDrawing").innerHTML="LANA";

    displayPannello();

    displayBancale();
    
    interval = setInterval(intervalFunctions, frequenza_aggiornamento_dati_linea);
});
async function displayBancale()
{
    bancale=await getBancaleAperto();
    document.getElementById("labelBancaleAperto").innerHTML="BANCALE : <b>#"+bancale.id_bancale+"</b>";
    document.getElementById("labelPannelliBancaleAperto").innerHTML="PANNELLI : <b>"+bancale.pannelli.length+"</b>";

    var comandiUscitaTableContainer=document.getElementById("comandiUscitaTableContainer");
    comandiUscitaTableContainer.innerHTML="";

    if(bancale.pannelli.length>0)
    {
        var table=document.createElement("table");
        table.setAttribute("id","tablePannelliBancale");

        var thead=document.createElement("thead");

        var tr=document.createElement("tr");
        var th=document.createElement("th");
        th.innerHTML="ODP";
        tr.appendChild(th);
        var th=document.createElement("th");
        th.innerHTML="CABINA";
        tr.appendChild(th);
        var th=document.createElement("th");
        th.innerHTML="PANNELLO";
        tr.appendChild(th);
        var th=document.createElement("th");
        th.innerHTML="ELETTRIFICATO";
        tr.appendChild(th);
        var th=document.createElement("th");
        th.innerHTML="#";
        tr.appendChild(th);
        thead.appendChild(tr);

        table.appendChild(thead);

        var tbody=document.createElement("tbody");

        bancale.pannelli.forEach(pannello =>
        {
            var tr=document.createElement("tr");
            var td=document.createElement("td");
            td.innerHTML=pannello.ordine_di_produzione;
            tr.appendChild(td);
            var td=document.createElement("td");
            td.innerHTML=pannello.numero_cabina;
            tr.appendChild(td);
            var td=document.createElement("td");
            td.innerHTML=pannello.codice_pannello;
            tr.appendChild(td);
            var td=document.createElement("td");
            if(pannello.elettrificato=="true")
            {
                var icon=document.createElement("i");
                icon.setAttribute("class","fas fa-bolt");
                td.appendChild(icon);
            }
            tr.appendChild(td);
            var td=document.createElement("td");
            td.innerHTML=pannello.id_distinta;
            tr.appendChild(td);
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);

        comandiUscitaTableContainer.appendChild(table);
    }
}
function getBancaleAperto()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getBancaleAperto.php",{id_utente},
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
                        resolve(JSON.parse(response));
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
        if(pannello.ruotato)
            document.getElementById("labelRuotato").innerHTML="RUOTATO : <b>SI</b>";
        else
            document.getElementById("labelRuotato").innerHTML="RUOTATO : <b>NO</b>";

        currentDrawing="lana";
        document.getElementById("labelToggleDrawing").innerHTML="LANA";

        getDrawingLana();
        getPdf(pannello.codice_pannello);
    }
    else
        clearPannello();
}
function clearPannello()
{
    pannello=null;
    
    document.getElementById("labelOrdineDiProduzione").innerHTML="ODP :";
    document.getElementById("labelCodicePannello").innerHTML="PANNELLO :";
    document.getElementById("labelNumeroCabina").innerHTML="CABINA :";
    document.getElementById("labelIdDistinta").innerHTML="# :";
    document.getElementById("labelIdIncollaggio").innerHTML="ID INCOLLAGGIO :";
    document.getElementById("labelRuotato").innerHTML="RUOTATO :";

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
        $.get("getPannelloUscita.php",
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
    {
        if(pannello!=null)
        {
            clearInterval(interval);
            //console.log("1")
            var response=await scaricaPannello();
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                console.log(response);
            displayBancale();
        }
        clearPannello();
    }
    else
    {
        if(pannello==null)
            displayPannello();
        else
        {
            if(pannelloCheck.id_incollaggio != pannello.id_incollaggio)
            {
                clearInterval(interval);
                //console.log("2")
                var response=await scaricaPannello();
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                    console.log(response);
                displayBancale();
                displayPannello();
            }
        }
    }
}
function scaricaPannello()
{
    return new Promise(function (resolve, reject) 
    {
        //console.log("scarico",pannello.faccia,pannello.id_distinta)
        $.get("scaricaPannello.php",
        {
            id_distinta:pannello.id_distinta,
            faccia:pannello.faccia,
            configurazione:pannello.configurazione
        },
        function(response, status)
        {
            if(status=="success")
            {
                setTimeout(() => {
                    interval = setInterval(intervalFunctions, frequenza_aggiornamento_dati_linea);
                }, frequenza_aggiornamento_dati_linea);
                resolve(response);
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
function toggleDrawing()
{
    if(currentDrawing=='lana')
    {
        document.getElementById("labelToggleDrawing").innerHTML="LAMIERA";
        getDrawingLamiera();
        currentDrawing="lamiera";
    }
    else
    {
        document.getElementById("labelToggleDrawing").innerHTML="LANA";
        getDrawingLana();
        currentDrawing="lana";
    }
}
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
    //console.clear();
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

                $.get("avanzaPannelloUscita.php",
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
                            displayBancale();
                            Swal.close();
                        }
                    }
                });
            }
        });
    }
}
async function chiudiBancale()
{
    document.getElementById("comandiUscitaButtonChiudiBancale").disabled = true;
    document.getElementById("comandiUscitaButtonCambiaBancale").disabled = true;

    var bancale_in_pausa=await getBancaleInPausa();

    $.get("chiudiBancale.php",{id_bancale:bancale.id_bancale,id_utente},
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
                stampaEtichettaBancale(bancale.id_bancale);
                if(bancale_in_pausa==null)
                    creaNuovoBancale();
                else
                {
                    Swal.fire
                    ({
                        background:"#404040",
                        icon:"success",
                        title:"Bancale #"+bancale.id_bancale+" chiuso",
                        text:"Il bancale #"+bancale_in_pausa.id_bancale+" è in pausa",
                        width:"600px",
                        allowOutsideClick:false,
                        //position:"top",
                        showCloseButton:false,
                        showConfirmButton:true,
                        allowEscapeKey:false,
                        showCancelButton:true,
                        confirmButtonText:"CREA NUOVO BANCALE",
                        cancelButtonText:"RIAPRI IL BANCALE #"+bancale_in_pausa.id_bancale,
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
                            creaNuovoBancale();
                        else
                            riapriBancale(bancale_in_pausa.id_bancale);
                    });
                }
                setTimeout(() => {
                    document.getElementById("comandiUscitaButtonChiudiBancale").disabled = false;
                    document.getElementById("comandiUscitaButtonCambiaBancale").disabled = false;
                }, 3000);
            }
        }
    });
}
function riapriBancale(id_bancale)
{
    $.post("riapriBancale.php",{id_bancale},
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
                displayBancale();
        }
    });
}
function creaNuovoBancale()
{
    $.post("creaNuovoBancale.php",{id_utente},
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
                displayBancale();
        }
    });
}
function getBancaleInPausa()
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getBancaleInPausa.php",
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
                        resolve(JSON.parse(response));
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
async function cambiaBancale()
{
    document.getElementById("comandiUscitaButtonCambiaBancale").disabled = true;
    document.getElementById("comandiUscitaButtonChiudiBancale").disabled = true;

    $.get("cambiaBancale.php",{id_bancale:bancale.id_bancale,id_utente},
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
                displayBancale();
                setTimeout(() => {
                    document.getElementById("comandiUscitaButtonCambiaBancale").disabled = false;
                    document.getElementById("comandiUscitaButtonChiudiBancale").disabled = false;
                }, 3000);
            }
        }
    });
}
async function stampaEtichettaBancale(id_bancale_chiuso)
{
    var bancale_chiuso=await getBancale(id_bancale_chiuso);
    if(bancale_chiuso.pannelli.length >0)
    {
        var costruzione = [];
        var lotto = [];
        var odp = [];
        bancale_chiuso.pannelli.forEach(element =>
        {
            costruzione.push(element.descrizione);
        });
        bancale_chiuso.pannelli.forEach(element =>
        {
            lotto.push(element.lotto);
        });
        bancale_chiuso.pannelli.forEach(element =>
        {
            odp.push(element.ordine_di_produzione);
        });
        costruzione = [...new Set(costruzione)];
        lotto = [...new Set(lotto)];
        odp = [...new Set(odp)];
    
        var server_adress=await getServerValue("SERVER_ADDR");
        var server_port=await getServerValue("SERVER_PORT");
    
        var eight = 28.5;
        var width = 19;
    
        var printWindow = window.open('', '_blank', 'height=1080,width=1920');
    
        printWindow.document.body.setAttribute("onafterprint","window.close();");
    
        printWindow.document.body.style.backgroundColor="white";
        printWindow.document.body.style.overflow="hidden";
    
        var style=document.createElement("script");
        style.innerHTML="@media print {.pagebreak { page-break-before: always; }}";
        printWindow.document.head.appendChild(style);
    
        var link=document.createElement("link");
        link.setAttribute("href","http://"+server_adress+":"+server_port+"/dw_incollaggio/css/fonts.css");
        link.setAttribute("rel","stylesheet");
        printWindow.document.head.appendChild(link);
    
        var outerContainer=document.createElement("div");
        outerContainer.setAttribute("id","printContainer");
        outerContainer.setAttribute("style","display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;height: "+eight+"cm;width: "+width+"cm;border:.5mm solid black;box-sizing:border-box;margin:5mm");
        
        //---------Costruzione
        var row=document.createElement("div");
        row.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis;min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:5%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
        var div=document.createElement("div");
        div.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis;overflow:hidden;min-width:50%;max-width:50%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box;padding-left:10px;padding-right:10px");
        var span=document.createElement("span");
        span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:2.8cm;max-width:2.8cm;width:2.8cm;white-space: nowrap;overflow: hidden;text-overflow: clip; ");
        span.innerHTML="<b>Costruzione: </b>";
        div.appendChild(span);
        var span=document.createElement("span");
        span.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis; font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 2.8cm);max-width:calc(100% - 2.8cm);width:calc(100% - 2.8cm);");
        span.innerHTML=costruzione;
        div.appendChild(span);
        row.appendChild(div);
        outerContainer.appendChild(row);
    
        //---------Lotto
        var div=document.createElement("div");
        div.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis;overflow:hidden;min-width:40%;max-width:40%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;box-sizing:border-box;padding-left:10px;padding-right:10px");
        var span=document.createElement("span");
        span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:1.3cm;max-width:1.3cm;width:1.3cm;white-space: nowrap;overflow: hidden;text-overflow: clip;");
        span.innerHTML="<b>Lotto: </b>";
        div.appendChild(span);
        var span=document.createElement("span");
        span.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis; font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 1.3cm);max-width:calc(100% - 1.3cm);width:calc(100% - 1.3cm);");
        span.innerHTML=lotto;
        div.appendChild(span);
        row.appendChild(div);
        outerContainer.appendChild(row);
        
        //---------Logo
        var img=document.createElement("img");
        img.setAttribute("style","min-width:10%;max-width:10%;width:10%;min-height:100%;max-height:100%;height:100%;box-sizing:border-box");
        img.setAttribute("src","http://"+server_adress+":"+server_port+"/dw_incollaggio/images/logo_bw.png");
        row.appendChild(img);
    
        /*//---------Ordine di produzione
        var row=document.createElement("div");
        row.setAttribute("style","min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:5%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box;padding-left:10px;padding-right:10px");
        var div=document.createElement("div");
        div.setAttribute("style","min-width:100%;width:100%;min-height:100%;max-height:100%;height:100%;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
        var span=document.createElement("span");
        span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:4.8cm;max-width:4.8cm;width:4.8cm;white-space: nowraptext-overflow: clip;");
        span.innerHTML="<b>Ordine di produzione: </b>";
        div.appendChild(span);
        var span=document.createElement("span");
        span.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis; font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 4.8cm);max-width:calc(100% - 4.8cm);width:calc(100% - 4.8cm);");
        span.innerHTML=odp;
        div.appendChild(span);
        row.appendChild(div);
        outerContainer.appendChild(row);*/
    
        //---------Ordine di produzione
        var row=document.createElement("div");
        row.setAttribute("style","min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:5%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
        var div=document.createElement("div");
        div.setAttribute("style","overflow:hidden;min-width:60%;max-width:60%;width:60%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box;padding-left:10px;padding-right:10px");
        var span=document.createElement("span");
        span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);white-space: nowrap;overflow: hidden;text-overflow: clip;");
        span.innerHTML="<b>Ordine di produzione: </b>"+odp;
        div.appendChild(span);
        row.appendChild(div);
        outerContainer.appendChild(row);
    
        //---------Firma
        var div=document.createElement("div");
        div.setAttribute("style","overflow:hidden;min-width:40%;max-width:40%;width:40%;min-height:100%;max-height:100%;height:100%;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box;padding-left:10px;padding-right:10px");
        var span=document.createElement("span");
        span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);white-space: nowrap;overflow: hidden;text-overflow: clip;");
        span.innerHTML="<b>Firma: </b>";
        div.appendChild(span);
        row.appendChild(div);
        outerContainer.appendChild(row);
    
        //---------Orario apertura
        var row=document.createElement("div");
        row.setAttribute("style","min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:5%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
        var div=document.createElement("div");
        div.setAttribute("style","overflow:hidden;min-width:50%;max-width:50%;width:50%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box;padding-left:10px;padding-right:10px");
        var span=document.createElement("span");
        span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);white-space: nowrap;overflow: hidden;text-overflow: clip;");
        span.innerHTML="<b>Orario di apertura: </b>"+bancale_chiuso.dataOraAperturaString;
        div.appendChild(span);
        row.appendChild(div);
        outerContainer.appendChild(row);
    
        //---------Orario chiusura
        var div=document.createElement("div");
        div.setAttribute("style","overflow:hidden;min-width:50%;max-width:50%;width:50%;min-height:100%;max-height:100%;height:100%;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box;padding-left:10px;padding-right:10px");
        var span=document.createElement("span");
        span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);white-space: nowrap;overflow: hidden;text-overflow: clip;");
        span.innerHTML="<b>Orario di chiusura: </b>"+bancale_chiuso.dataOraChiusuraString;
        div.appendChild(span);
        row.appendChild(div);
        outerContainer.appendChild(row);
    
        //---------Contenitore tabelle pannelli
        var tablesContainer=document.createElement("div");
        tablesContainer.setAttribute("style","min-height:85%;max-height:85%;height:85%;width: 100%;min-width:100%;max-width:100%;overflow:hidden;display:flex;flex-direction:row;align-items:flex-start;justify-content:flex-start");
        var table1Container = document.createElement("div");
        table1Container.setAttribute("style", "min-height:100%;max-height:100%;height:100%;width: 50%;min-width:50%;max-width:50%;overflow:hidden");
        var table1=document.createElement("table");
        table1.setAttribute("style","max-height:100%;width: 100%;min-width:100%;max-width:100%;overflow:hidden");
        table1Container.appendChild(table1);
        tablesContainer.appendChild(table1Container);
    
        var table2Container = document.createElement("div");
        table2Container.setAttribute("style", "min-height:100%;max-height:100%;height:100%;width: 50%;min-width:50%;max-width:50%;overflow:hidden");
        var table2=document.createElement("table");
        table2.setAttribute("style","max-height:100%;width: 100%;min-width:100%;max-width:100%;overflow:hidden");
        table2Container.appendChild(table2);
        if(bancale_chiuso.pannelli.length>40)
            tablesContainer.appendChild(table2Container);
    
        outerContainer.appendChild(tablesContainer);
    
        var nRows=41;
        var trHeight=((85*eight)/100)/nRows;
        var tr=document.createElement("tr");
        var th=document.createElement("th");
        th.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;font-weight:bold;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
        th.innerHTML="N.";
        tr.appendChild(th);
        var th=document.createElement("th");
        th.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;font-weight:bold;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
        th.innerHTML="Pannello";
        tr.appendChild(th);
        var th=document.createElement("th");
        th.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;font-weight:bold;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
        th.innerHTML="#";
        tr.appendChild(th);
        var th=document.createElement("th");
        th.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;font-weight:bold;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
        th.innerHTML="Elettr.";
        tr.appendChild(th);
        var th=document.createElement("th");
        th.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;font-weight:bold;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
        th.innerHTML="Numero cabina";
        tr.appendChild(th);
        table1.appendChild(tr);
        table2.appendChild(tr.cloneNode(true));
    
        var i=1;
        bancale_chiuso.pannelli.forEach(pannello =>
        {
            var tr=document.createElement("tr");
            var td=document.createElement("td");
            td.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
            td.innerHTML=i;
            tr.appendChild(td);
            var td=document.createElement("td");
            td.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
            td.innerHTML=pannello.codice_pannello;
            tr.appendChild(td);
            var td=document.createElement("td");
            td.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
            td.innerHTML=pannello.id_distinta;
            tr.appendChild(td);
            var td=document.createElement("td");
            td.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
            if(pannello.elettrificato=="true")
                td.innerHTML="V";
            else
                td.innerHTML="X";
            tr.appendChild(td);
            var td=document.createElement("td");
            td.setAttribute("style","min-height:"+trHeight+"px;max-height:"+trHeight+"px;height:"+trHeight+"px;white-space: nowrap;overflow: hidden;text-overflow: clip;font-family: 'Questrial', sans-serif;font-size:3.5mm;border:.5mm solid black;box-sizing:border-box;padding-left:5px;padding-right:5px");
            td.innerHTML=pannello.numero_cabina;
            tr.appendChild(td);
    
            if(i<nRows)
                table1.appendChild(tr);
            else
                table2.appendChild(tr);
    
            i++;
        });
    
        //---------
    
        var script=document.createElement("script");
        script.innerHTML="setTimeout(function(){window.print();}, 500);";
        outerContainer.appendChild(script);
     
        printWindow.document.body.appendChild(outerContainer);
    }
}
function getBancale(id_bancale)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getBancale.php",{id_bancale},
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
                        resolve(JSON.parse(response));
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