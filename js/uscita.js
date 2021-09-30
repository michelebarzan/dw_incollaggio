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
        $.get("getBancaleAperto.php",
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
        $.get("scaricaPannello.php",
        {
            id_distinta:pannello.id_distinta,
            faccia:pannello.faccia
        },
        function(response, status)
        {
            if(status=="success")
            {
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
            }
        }
    });
}
async function stampaEtichettaBancale(id_bancale_chiuso)
{
    var bancale_chiuso=await getBancale(id_bancale_chiuso);
    console.log(bancale_chiuso);
	var costruzione = [];
	var lotto = [];
	var odp = [];
    bancale_chiuso.pannelli.forEach(element => {
            costruzione.push(element.descrizione);
    });
    bancale_chiuso.pannelli.forEach(element => {
            lotto.push(element.lotto);
    });
    bancale_chiuso.pannelli.forEach(element => {
            odp.push(element.ordine_di_produzione);
    });
    costruzione = [...new Set(costruzione)];
    lotto = [...new Set(lotto)];
    odp = [...new Set(odp)];

    console.log(costruzione);
    console.log(lotto);
    console.log(odp);

    var server_adress=await getServerValue("SERVER_ADDR");
    var server_port=await getServerValue("SERVER_PORT");

    var eight = 28;
    var width = 19;

    var printWindow = window.open('', '_blank', 'height=100,width=100');

    printWindow.document.body.setAttribute("onafterprint","window.close();");

    printWindow.document.body.style.backgroundColor="white";
    printWindow.document.body.style.overflow="hidden";


	var style=document.createElement("script");
	//style.innerHTML="@media print {.pagebreak { page-break-before: always; }}";
    printWindow.document.head.appendChild(style);

    var link=document.createElement("link");
    link.setAttribute("href","http://"+server_adress+":"+server_port+"/dw_incollaggio/css/fonts.css");
    link.setAttribute("rel","stylesheet");
    printWindow.document.head.appendChild(link);

    var outerContainer=document.createElement("div");
    outerContainer.setAttribute("id","printContainer");
    outerContainer.setAttribute("style","display: flex;flex-direction: row;align-items: flex-start;justify-content: flex-start;height: "+eight+"cm;width: "+width+"cm;border:.5mm solid black;box-sizing:border-box;margin:5mm");
    var innerContainer=document.createElement("div");
    innerContainer.setAttribute("style","display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;min-width:90%;max-width:100%;width:100%;min-height:100%;max-height:100%;height:100%;box-sizing:border-box");

//---------Costruzione
    var row=document.createElement("div");
    row.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis;min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:13%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
    var div=document.createElement("div");
    div.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis;overflow:hidden;min-width:50%;max-width:50%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:2cm;max-width:2cm;width:2cm;margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip; padding-left:10px;");
    span.innerHTML="<b>Costruzione: </b>";
    div.appendChild(span);
    var span=document.createElement("span");
    span.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis; font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 2cm);max-width:calc(100% - 2cm);width:calc(100% - 2cm);");
    span.innerHTML=costruzione;
    div.appendChild(span);
    row.appendChild(div);
    innerContainer.appendChild(row);
//---------Lotto
    var div=document.createElement("div");
    div.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis;overflow:hidden;min-width:40%;max-width:40%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:1cm;max-width:1cm;width:1cm;margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Lotto: </b>";
    div.appendChild(span);
    var span=document.createElement("span");
    span.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis; font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 2cm);max-width:calc(100% - 2cm);width:calc(100% - 2cm);");
    span.innerHTML=lotto;
    div.appendChild(span);
    row.appendChild(div);
    innerContainer.appendChild(row);
//---------Logo
    var img=document.createElement("img");
    img.setAttribute("style","min-width:10%;max-width:10%;width:15%;min-height:100%;max-height:100%;height:100%;box-sizing:border-box");
    img.setAttribute("src","http://"+server_adress+":"+server_port+"/dw_incollaggio/images/logo_bw.png");
    row.appendChild(img);

//---------Ordine di produzione
    var row=document.createElement("div");
    row.setAttribute("style","min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:13%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
    var div=document.createElement("div");
    div.setAttribute("style","min-width:100%;width:100%;min-height:100%;max-height:100%;height:100%;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:2cm;max-width:2cm;width:2cm;margin-left:5px;margin-right:5px;white-space: nowraptext-overflow: clip;");
    span.innerHTML="<b>Ordine di produzione: </b>";
    div.appendChild(span);
    var span=document.createElement("span");
    span.setAttribute("style","white-space: nowrap;overflow: hidden;text-overflow: ellipsis; font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 3cm);max-width:calc(100% - 2cm);width:calc(100% - 2cm);");
    span.innerHTML=odp;
    div.appendChild(span);
    row.appendChild(div);
    innerContainer.appendChild(row);
//---------Orario apertura
    var row=document.createElement("div");
    row.setAttribute("style","min-width:100%;max-width:100%;width:100%;min-height:5%;max-height:13%;height:5%;display: flex;flex-direction: row;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:50%;max-width:50%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Orario di apertura: </b>"+bancale_chiuso.dataOraAperturaString;
    div.appendChild(span);
    row.appendChild(div);
    innerContainer.appendChild(row);
//---------Orario chiusura
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:50%;max-width:50%;width:100%;min-height:100%;max-height:100%;height:100%;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Orario di chiusura: </b>"+bancale_chiuso.dataOraChiusuraString;
    div.appendChild(span);
    row.appendChild(div);
    innerContainer.appendChild(row);
//---------Contenitore tabelle pannelli
    var tableContainer = document.createElement("div");
    tableContainer.setAttribute("style", "display: flex; flex-direction: row; align-items: flex-start;justify-content: center;height: 100%; width: 100%;");
//---------Intestazione pannelli colonna 1
    var row1=document.createElement("div");
    row1.setAttribute("style","min-width:50%;max-width:50%;width:100%;min-height:5%;max-height:13%;height:10%;display: flex;flex-direction: row; flex-wrap: wrap; align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:8%;max-width:8%;width:100%;min-height:100%;max-height:100%;height:100%;display:flex;border-right:.5mm solid black;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>N: </b>"
    div.appendChild(span);
    row1.appendChild(div);
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:23%;max-width:23%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Pannello: </b>"
    div.appendChild(span);
    row1.appendChild(div);
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:23%;max-width:23%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>#: </b>"
    div.appendChild(span);
    row1.appendChild(div);
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:23%;max-width:23%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Elett.: </b>"
    div.appendChild(span);
    row1.appendChild(div);
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:23%;max-width:23%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.9mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Cabina: </b>"
    div.appendChild(span);
    row1.appendChild(div);
    tableContainer.appendChild(row1);
//---------Intestazione pannelli colonna 2
    var row2=document.createElement("div");
    row2.setAttribute("style","min-width:50%;max-width:50%;width:100%;min-height:5%;max-height:13%;height:10%;display: flex;flex-direction: row; flex-wrap: wrap;align-items: center;justify-content: flex-end;border-bottom:.5mm solid black;box-sizing:border-box");
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:25%;max-width:25%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Pannello: </b>"
    div.appendChild(span);
    row2.appendChild(div);
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:25%;max-width:25%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>#: </b>"
    div.appendChild(span);
    row2.appendChild(div);
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:25%;max-width:25%;width:100%;min-height:100%;max-height:100%;height:100%;border-right:.5mm solid black;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Elett.: </b>"
    div.appendChild(span);
    row2.appendChild(div);
    var div=document.createElement("div");
    div.setAttribute("style","overflow:hidden;min-width:25%;max-width:25%;width:100%;min-height:100%;max-height:100%;height:100%;display:flex;flex-direction:row;align-items:center;justify-content:center;box-sizing:border-box");
    var span=document.createElement("span");
    span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
    span.innerHTML="<b>Cabina: </b>"
    div.appendChild(span);
    row2.appendChild(div);
    tableContainer.appendChild(row2);
    innerContainer.appendChild(tableContainer);
//---------Popolo tabelle
var i = 1;
    bancale_chiuso.pannelli.forEach(pannello => {
        if(i<=25){
            var row=document.createElement("div");
            row.setAttribute("style","min-width:8%;max-width:8%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=i;
            row.appendChild(span);
            row1.appendChild(row);
            var row=document.createElement("div");
            row.setAttribute("style","min-width:23%;max-width:23%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=pannello.codice_pannello;
            row.appendChild(span);
            row1.appendChild(row);
            var row=document.createElement("div");
            row.setAttribute("style","min-width:23%;max-width:23%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=pannello.id_distinta;
            row.appendChild(span);
            row1.appendChild(row);
            var row=document.createElement("div");
            row.setAttribute("style","min-width:23%;max-width:23%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=pannello.elettrificato;
            row.appendChild(span);
            row1.appendChild(row);
            var row=document.createElement("div");
            row.setAttribute("style","min-width:22%;max-width:23%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black; border-right:.9mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=pannello.numero_cabina;
            row.appendChild(span);
            row1.appendChild(row);
        }else{
            var row=document.createElement("div");
            row.setAttribute("style","min-width:8%;max-width:8%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=i;
            row.appendChild(span);
            row2.appendChild(row);
            var row=document.createElement("div");
            row.setAttribute("style","min-width:23%;max-width:23%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=pannello.codice_pannello;
            row.appendChild(span);
            row2.appendChild(row);
            var row=document.createElement("div");
            row.setAttribute("style","min-width:23%;max-width:23%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=pannello.id_distinta;
            row.appendChild(span);
            row2.appendChild(row);
            var row=document.createElement("div");
            row.setAttribute("style","min-width:23%;max-width:23%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black;box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=pannello.elettrificato;
            row.appendChild(span);
            row2.appendChild(row);
            var row=document.createElement("div");
            row.setAttribute("style","min-width:22%;max-width:23%;width:100%;min-height:5%;max-height:20%;height:100%;display: flex; flex-direction: column;align-items: center;justify-content: flex-start;border-bottom:.5mm solid black; box-sizing:border-box");
            var span=document.createElement("span");
            span.setAttribute("style","font-family: 'Questrial', sans-serif;font-size:3.5mm;min-width:calc(100% - 10px);max-width:calc(100% - 10px);width:calc(100% - 10px);margin-left:5px;margin-right:5px;white-space: nowrap;overflow: hidden;text-overflow: clip;");
            span.innerHTML=pannello.numero_cabina;
            row.appendChild(span);
            row2.appendChild(row);
        }
        i++;
    });
//---------
    outerContainer.appendChild(innerContainer);    
	var script=document.createElement("script");
	//script.innerHTML="setTimeout(function(){window.print();}, 200);";
    outerContainer.appendChild(script);
 
    printWindow.document.body.appendChild(outerContainer);
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
