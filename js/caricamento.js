var iframe;
var id_utente;
var interval;
var frequenza_aggiornamento_dati_linea
var shownPdf;
var stazione;
var stazioni;
var view;
var odpSelezionato;
var cabinaSelezionata;
var pannelloSelezionato;
var pannelli;
var intervalOverflowPdf1;
var intervalOverflowPdf2;

window.addEventListener("load", async function(event)
{
    startClock();

    id_utente=await getSessionValue("id_utente");

    frequenza_aggiornamento_dati_linea=await getParametro("frequenza_aggiornamento_dati_linea");
    frequenza_aggiornamento_dati_linea=parseInt(frequenza_aggiornamento_dati_linea);
    
    var nome_stazione=await getSessionValue("stazione");

    var stazioni=await getAnagraficaStazioni();

    stazione=getFirstObjByPropValue(stazioni,"nome",nome_stazione);

    document.getElementById("infoStazioneContainer").innerHTML=stazione.label;
    document.getElementById("infoStazioneContainer").setAttribute("nome",stazione.nome);
    document.getElementById("infoStazioneContainer").setAttribute("id_stazione",stazione.id_stazione);

    var username=await getSessionValue("username");
    document.getElementById("usernameContainer").innerHTML=username+'<i class="fad fa-user" style="margin-left:10px"></i>';

    getListOrdiniDiProduzione();

    setFocus();
    
    //interval = setInterval(intervalFunctions, frequenza_aggiornamento_dati_linea);
});
/*function intervalFunctions()
{
    setFocus();
}*/
window.addEventListener("keydown", async function(event)
{
    setFocus();
    var keyCode=event.keyCode;
    //console.log(keyCode);
    switch (keyCode) 
    {
        case 9:event.preventDefault();break;//TAB
        case 112:event.preventDefault();break;//F1
        case 113:event.preventDefault();break;//F2
        case 114:event.preventDefault();break;//F3
        case 115:event.preventDefault();break;//F4
        case 116:event.preventDefault();break;//F5
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
function setFocus()
{
    document.getElementById("inputSearchCodicePannello").focus();
}
async function getListOrdiniDiProduzione()
{
    view="odp";

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>'

    odpSelezionato=null;
    document.getElementById("labelLottoSelezionato").innerHTML="ODP :";
    cabinaSelezionata=null;
    document.getElementById("labelCabinaSelezionata").innerHTML="CABINA :";
    pannelloSelezionato=null;
    document.getElementById("labelId_distintaSelezionata").innerHTML="# :";
    document.getElementById("labelPannelloSelezionato").innerHTML="PANNELLO :";
    cleanPannelliItem();

    document.getElementById("containerNItems").innerHTML="";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    document.getElementById("messageCodicePannello").innerHTML="";
    document.getElementById("inputSearchCodicePannello").value="";

    var ordini_di_produzione=await getOrdiniDiProduzione();

    document.getElementById("containerNItems").innerHTML="<span><b style='letter-spacing:1px'>"+ordini_di_produzione.length+"</b> righe</span>";

    container.innerHTML="";

    var i=1;

    ordini_di_produzione.forEach(function (ordine_di_produzione)
    {
        var item=document.createElement("button");
        if(i!=ordini_di_produzione.length)
            item.setAttribute("style","margin-bottom:10px");
        item.setAttribute("class","odp-item");
        item.setAttribute("id","odpItem"+ordine_di_produzione.id_ordine_di_produzione);
        item.setAttribute("onclick","selectOdp("+ordine_di_produzione.id_ordine_di_produzione+",'"+ordine_di_produzione.ordine_di_produzione+"')");

        var span=document.createElement("span");
        span.setAttribute("style","margin-left:10px;");
        span.innerHTML=ordine_di_produzione.ordine_di_produzione;
        item.appendChild(span);

        var span=document.createElement("span");
        span.setAttribute("class","odp-item-span-lotto");
        span.setAttribute("style","margin-left:auto;box-sizing:border-box;padding-left:10px;padding-right:10px;height: 35px;line-height: 35px;background-color:#242424;border-top-right-radius:4px;border-bottom-right-radius:4px");
        span.innerHTML=ordine_di_produzione.lotto;
        item.appendChild(span);

        container.appendChild(item);

        i++;
    });

    var widths=[];
    var elements=document.getElementsByClassName("odp-item-span-lotto");
    for (let index = 0; index < elements.length; index++)
    {
        const element = elements[index];
        widths.push(element.offsetWidth);
    }
    var max=Math.max.apply(null, widths);
    if(max>100)
        max=100;    
    var elements=document.getElementsByClassName("odp-item-span-lotto");
    for (let index = 0; index < elements.length; index++)
    {
        const element = elements[index];
        element.style.width=(max+5)+"px";
    }
}
function selectOdp(id_ordine_di_produzione,ordine_di_produzione)
{
    odpSelezionato=id_ordine_di_produzione;
    document.getElementById("labelLottoSelezionato").innerHTML="ODP : <b>"+ordine_di_produzione+"</b>";

    getListCabine();
}
async function getListCabine()
{
    view="cabine";

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>'

    cabinaSelezionata=null;
    document.getElementById("labelCabinaSelezionata").innerHTML="CABINA :";
    pannelloSelezionato=null;
    document.getElementById("labelId_distintaSelezionata").innerHTML="# :";
    document.getElementById("labelPannelloSelezionato").innerHTML="PANNELLO :";
    cleanPannelliItem();

    document.getElementById("containerNItems").innerHTML="";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    document.getElementById("messageCodicePannello").innerHTML="";
    document.getElementById("inputSearchCodicePannello").value="";

    var cabine=await getCabine();

    document.getElementById("containerNItems").innerHTML="<span><b style='letter-spacing:1px'>"+cabine.length+"</b> righe</span>";

    container.innerHTML="";

    var i=1;

    cabine.forEach(function (cabina)
    {
        var item=document.createElement("button");
        if(i!=cabine.length)
            item.setAttribute("style","margin-bottom:10px");
        item.setAttribute("class","cabine-item");
        item.setAttribute("id","cabineItem"+cabina);
        item.setAttribute("onclick","selectCabina('"+cabina+"')");

        var span=document.createElement("span");
        span.setAttribute("style","margin-left:10px;");
        span.innerHTML=cabina;
        item.appendChild(span);

        container.appendChild(item);

        i++;
    });
}
function selectCabina(cabina)
{
    cabinaSelezionata=cabina;
    document.getElementById("labelCabinaSelezionata").innerHTML="CABINA : <b>"+cabina+"</b>";

    getListPannelli();
}
async function getListPannelli()
{
    view="pannelli";

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i><span>Caricamento in corso...</span></div>'

    pannelloSelezionato=null;
    document.getElementById("labelId_distintaSelezionata").innerHTML="# :";
    document.getElementById("labelPannelloSelezionato").innerHTML="PANNELLO :";
    cleanPannelliItem();

    document.getElementById("containerNItems").innerHTML="";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    document.getElementById("messageCodicePannello").innerHTML="";
    document.getElementById("inputSearchCodicePannello").value="";

    pannelli=await getPannelli();

    document.getElementById("containerNItems").innerHTML="<span><b style='letter-spacing:1px'>"+pannelli.length+"</b> righe</span>";

    container.innerHTML="";

    var i=1;

    pannelli.forEach(function (pannello)
    {
        var item=document.createElement("button");
        if(i!=pannelli.length)
            item.setAttribute("style","margin-bottom:10px");
        item.setAttribute("class","pannelli-item");
        item.setAttribute("id","pannelliItem"+pannello.id_distinta);
        item.setAttribute("onclick","selectPannello("+pannello.id_distinta+","+pannello.id_pannello+",'"+pannello.codice_pannello+"')");

        var span=document.createElement("span");
        span.setAttribute("style","margin-left:10px;");
        span.innerHTML=pannello.codice_pannello;
        item.appendChild(span);

        var span=document.createElement("span");
        span.setAttribute("class","pannelli-item-span-id_distinta");
        span.setAttribute("style","margin-left:auto;box-sizing:border-box;padding-left:10px;padding-right:10px;height: 35px;line-height: 35px;background-color:#242424;border-top-right-radius:4px;border-bottom-right-radius:4px");
        span.innerHTML=pannello.id_distinta;
        item.appendChild(span);

        container.appendChild(item);

        i++;
    });

    var widths=[];
    var elements=document.getElementsByClassName("pannelli-item-span-id_distinta");
    for (let index = 0; index < elements.length; index++)
    {
        const element = elements[index];
        widths.push(element.offsetWidth);
    }
    var max=Math.max.apply(null, widths);
    if(max>100)
        max=100;    
    var elements=document.getElementsByClassName("pannelli-item-span-id_distinta");
    for (let index = 0; index < elements.length; index++)
    {
        const element = elements[index];
        element.style.width=(max+5)+"px";
    }
}
function selectPannello(id_distinta,id_pannello,codice_pannello)
{
    document.getElementById("messageCodicePannello").innerHTML="";
    document.getElementById("inputSearchCodicePannello").value="";

    pannelloSelezionato=id_distinta;
    document.getElementById("labelId_distintaSelezionata").innerHTML="# : <b>"+id_distinta+"</b>";
    document.getElementById("labelPannelloSelezionato").innerHTML="PANNELLO : <b>"+codice_pannello+"</b>";

    cleanPannelliItem();

    document.getElementById("pannelliItem"+id_distinta).style.boxShadow="0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";
    document.getElementById("pannelliItem"+id_distinta).style.backgroundColor="#494949";
    document.getElementById("pannelliItem"+id_distinta).style.color="#4C91CB";

    getPdf(codice_pannello);
}
function cleanPannelliItem()
{
    var items=document.getElementsByClassName("pannelli-item");
    for (let index = 0; index < items.length; index++)
    {
        const item = items[index];
        item.style.boxShadow="";
        item.style.backgroundColor="";
        item.style.color="";
    }
    shownPdf=null;
}
function keyUpInputCodicePannello(input)
{
    if(view=="pannelli")
    {
        var value=input.value;console.log(value.length);
        if(value.length>7)
        {
            input.value="";
            checkCodicePannello(value);
        }
    }
    else
    {
        input.value="";
    }
}
function checkCodicePannello(value)
{
    document.getElementById("messageCodicePannello").innerHTML="<i class='fad fa-spinner-third fa-spin' style='color:#ddd'></i>";

    var check=false;
    var codice_pannello;
    var id_distinta;
    var id_pannello;
    pannelli.forEach(pannello =>
    {
        if(pannello.codice_pannello.toLowerCase()==value.toLowerCase())
        {
            check=true;
            codice_pannello=pannello.codice_pannello;
            id_distinta=pannello.id_distinta;
            id_pannello=pannello.id_pannello;
        }
    });

    if(check)
    {
        selectPannello(id_distinta,id_pannello,codice_pannello);
        document.getElementById("messageCodicePannello").innerHTML="";
    }
    else
    {
        document.getElementById("messageCodicePannello").innerHTML="<span style='color:#DA6969'>Pannello non trovato</span>";
    }
}
async function getPdf(fileName)
{
    if(fileName != shownPdf)
    {
        shownPdf=fileName;
        var container=document.getElementById("pdfContainer");
        container.innerHTML="";
        iframe=null;

        iframe=document.createElement("iframe");
        iframe.setAttribute("id","");
        iframe.setAttribute("class","");
        iframe.setAttribute("onload","fixPdf(this);shownPdf='"+fileName+"';");
        var server_adress=await getServerValue("SERVER_ADDR");
        var server_port=await getServerValue("SERVER_PORT");
        iframe.setAttribute("src","http://"+server_adress+":"+server_port+"/dw_incollaggio_pdf/pdf.js/web/viewer.html?file=pdf/pannelli/"+fileName+".pdf");
        container.appendChild(iframe);
    }
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

    setTimeout(() =>
    {
        console.clear();
    }, 500);
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
            overflow=checkOverflow(iframe.contentWindow.document.getElementById("viewerContainer"));
            if(!overflow)
                pdfZoomin();
            else
            {
                clearInterval(intervalOverflowPdf1);
                intervalOverflowPdf2 = setInterval(() => 
                {
                    overflow=checkOverflow(iframe.contentWindow.document.getElementById("viewerContainer"));
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
   var curOverflow = el.style.overflow;

   if ( !curOverflow || curOverflow === "visible" )
      el.style.overflow = "hidden";

   var isOverflowing = el.clientWidth < el.scrollWidth 
      || el.clientHeight < el.scrollHeight;

   el.style.overflow = curOverflow;

   return isOverflowing;
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
function getOrdiniDiProduzione()
{
    return new Promise(function (resolve, reject) 
    {
        $.post("getOrdiniDiProduzioneCaricamento.php",
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
                resolve([]);
            }
        });
    });
}
function getCabine()
{
    return new Promise(function (resolve, reject) 
    {
        $.post("getCabineCaricamento.php",
        {
            id_ordine_di_produzione:odpSelezionato
        },
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
                resolve([]);
            }
        });
    });
}
function getPannelli()
{
    return new Promise(function (resolve, reject) 
    {
        $.post("getPannelliCaricamento.php",
        {
            id_ordine_di_produzione:odpSelezionato,numero_cabina:cabinaSelezionata
        },
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
                resolve([]);
            }
        });
    });
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
function listToTop()
{
    document.getElementById("listInnerContainer").scrollTop = 0;
}
function listToBottom()
{
    document.getElementById("listInnerContainer").scrollTo(0,document.getElementById("listInnerContainer").scrollHeight);
}
function listScrolltop()
{
    document.getElementById("listInnerContainer").scrollTop = document.getElementById("listInnerContainer").scrollTop-45;
}
function listScrolldown()
{
    document.getElementById("listInnerContainer").scrollTop = document.getElementById("listInnerContainer").scrollTop+45;
}
function cancelSelectPannello()
{
    pannelloSelezionato=null;
    document.getElementById("labelId_distintaSelezionata").innerHTML="# :";
    document.getElementById("labelPannelloSelezionato").innerHTML="PANNELLO :";
    cleanPannelliItem();

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    document.getElementById("messageCodicePannello").innerHTML="";
    document.getElementById("inputSearchCodicePannello").value="";
}
function confermaSelectPannello()
{
    if(pannelloSelezionato!=null)
    {
        $.post("caricaPannello.php",
        {
            id_distinta:pannelloSelezionato,
            id_utente,
            stazione:stazione.id_stazione
        },
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
                    document.getElementById("pannelliItem"+pannelloSelezionato).remove();
                    document.getElementsByClassName("pannelli-item")[document.getElementsByClassName("pannelli-item").length-1].style.marginBottom="0px";
                    document.getElementById("containerNItems").innerHTML="<span><b style='letter-spacing:1px'>"+(pannelli.length-1)+"</b> righe</span>";
                    cancelSelectPannello();
                }
            }
        });
    }
}
function indietro()
{
    switch (view)
    {
        case "odp":logout();break;
        case "cabine":getListOrdiniDiProduzione();break;
        case "pannelli":getListCabine();break;
    }
}
function logout()
{
    $.get("logout.php",
    function(response, status)
    {
        window.location = 'login.html';
    });
}