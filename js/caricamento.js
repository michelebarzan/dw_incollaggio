var iframe;
var id_utente;
var interval;
var frequenza_aggiornamento_dati_linea
var stazione;
var stazioni;
var view;
var odpSelezionato;
var cabinaSelezionata;
var pannelloSelezionato;
var facciaPannelloSelezionato;
var pannelli=[];
var intervalOverflowPdf1;
var intervalOverflowPdf2;
var popupErroriPlc=false;
var ordini_di_produzione;

window.addEventListener("load", async function(event)
{
    startClock();

    id_utente=await getSessionValue("id_utente");

    frequenza_aggiornamento_dati_linea=await getParametro("frequenza_aggiornamento_dati_linea");
    frequenza_aggiornamento_dati_linea=parseInt(frequenza_aggiornamento_dati_linea);
    
    var nome_stazione=await getSessionValue("stazione");

    stazioni=await getAnagraficaStazioni();

    stazione=getFirstObjByPropValue(stazioni,"nome",nome_stazione);

    svuotaLogoutStazione(stazione.id_stazione);

    document.getElementById("infoStazioneContainer").innerHTML=stazione.label;
    document.getElementById("infoStazioneContainer").setAttribute("nome",stazione.nome);
    document.getElementById("infoStazioneContainer").setAttribute("id_stazione",stazione.id_stazione);

    var username=await getSessionValue("username");
    document.getElementById("usernameContainer").innerHTML=username+'<i class="fad fa-user" style="margin-left:10px"></i>';

    getListOrdiniDiProduzione();

    setFocus();
    
    interval = setInterval(intervalFunctions, frequenza_aggiornamento_dati_linea);
});
function intervalFunctions()
{
    checkLogoutStazione(stazione.id_stazione);
	checkErroriPlc();
}
function checkErroriPlc()
{
	$.get("checkErroriPlc.php",
	function(response, status)
	{
		if(status=="success")
		{
			if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
			{
				console.log(response);
			}
			else
			{
				try
				{
					var error_message=JSON.parse(response);
					if(error_message.Stringa.indexOf("000")===-1)
					{
						if(!popupErroriPlc)
						{
							popupErroriPlc=true;
							Swal.fire
							({
								icon: 'error',
								title: "ERRORE PLC",
								text:error_message.Stringa,
								width:550,
								showCancelButton: false,
								showCloseButton:true,
								background:"#404040",
								showConfirmButton: false,
								onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="#ddd";document.getElementsByClassName("swal2-title")[0].style.fontSize="16px";document.getElementsByClassName("swal2-confirm")[0].style.fontSize="16px";document.getElementsByClassName("swal2-cancel")[0].style.fontSize="16px";document.getElementsByClassName("swal2-close")[0].style.outline="none";}
							}).then((result) =>
							{
								popupErroriPlc=false;
							});
						}
					}
					else
					{
						if(popupErroriPlc)
						{
							Swal.close();
							popupErroriPlc=false;
						}
					}
				}
				catch (error)
				{
					console.log(response);
					console.log(error);
				}
			}
		}
	});
}
window.addEventListener("keydown", async function(event)
{
    setFocus();
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
function setFocus()
{
    document.getElementById("inputSearchCodicePannello").focus();
}
async function getListOrdiniDiProduzione()
{
    view="odp";

    document.getElementById("labelCabinaSelezionata").parentElement.style.display="none";

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i></div>';

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

    odpSelezionato=null;
    document.getElementById("labelLottoSelezionato").innerHTML="ODP :";
    cabinaSelezionata=null;
    document.getElementById("labelCabinaSelezionata").innerHTML="CABINA :";
    pannelloSelezionato=null;
    facciaPannelloSelezionato=null;
    document.getElementById("labelId_distintaSelezionata").innerHTML="# :";
    document.getElementById("labelPannelloSelezionato").innerHTML="PANNELLO :";
    cleanPannelliItem();

    document.getElementById("containerNItems").innerHTML="";

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    document.getElementById("messageCodicePannello").innerHTML="";
    document.getElementById("inputSearchCodicePannello").value="";

    ordini_di_produzione=await getOrdiniDiProduzione();

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
        item.setAttribute("onclick","selectOdp("+ordine_di_produzione.id_ordine_di_produzione+")");

        var textContainer=document.createElement("div");
        textContainer.setAttribute("class","odp-item-text-container");

        var span=document.createElement("span");
        span.setAttribute("style","margin-left:10px;");
        span.innerHTML=ordine_di_produzione.ordine_di_produzione;
        textContainer.appendChild(span);

        var span=document.createElement("span");
        span.setAttribute("class","odp-item-span-lotto");
        span.setAttribute("style","margin-left:auto;box-sizing:border-box;padding-left:10px;padding-right:10px;height: 35px;line-height: 35px;background-color:#313131");
        span.innerHTML=ordine_di_produzione.lotto;
        textContainer.appendChild(span);

        item.appendChild(textContainer);

        var progressBarContainer=document.createElement("div");
        progressBarContainer.setAttribute("class","odp-item-progress-bar-container");

        var percentuale_pannelli_caricati=(ordine_di_produzione.pannelli_caricati*100)/ordine_di_produzione.totale_pannelli;

        var progressBar=document.createElement("div");
        progressBar.setAttribute("class","odp-item-progress-bar");
        if(percentuale_pannelli_caricati==100)
            progressBar.setAttribute("style","width:"+percentuale_pannelli_caricati+"%;background-color: #70B085;");
        else
            progressBar.setAttribute("style","width:"+percentuale_pannelli_caricati+"%;background-color: #4C91CB;");
        progressBarContainer.appendChild(progressBar);

        item.appendChild(progressBarContainer);

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

    Swal.close();
}
function selectOdp(id_ordine_di_produzione)
{
    odpSelezionato=id_ordine_di_produzione;
    var ordine_di_produzioneObj=getFirstObjByPropValue(ordini_di_produzione,"id_ordine_di_produzione",odpSelezionato);

    document.getElementById("labelLottoSelezionato").innerHTML="ODP : <b>"+ordine_di_produzioneObj.ordine_di_produzione+"</b>";

    if(ordine_di_produzioneObj.produzione_per_cabina)
    {
        document.getElementById("labelCabinaSelezionata").parentElement.style.display="flex";
        getListCabine();
    }
    else
    {
        document.getElementById("labelCabinaSelezionata").parentElement.style.display="none";
        getListPannelli();
    }
}
async function getListCabine()
{
    view="cabine";

    var container=document.getElementById("listInnerContainer");
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i></div>';

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

    cabinaSelezionata=null;
    document.getElementById("labelCabinaSelezionata").innerHTML="CABINA :";
    pannelloSelezionato=null;
    facciaPannelloSelezionato=null;
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
        item.setAttribute("id","cabineItem"+cabina.numero_cabina);
        item.setAttribute("onclick","selectCabina('"+cabina.numero_cabina+"')");

        var textContainer=document.createElement("div");
        textContainer.setAttribute("class","cabine-item-text-container");

        var span=document.createElement("span");
        span.setAttribute("style","margin-left:10px;");
        span.innerHTML=cabina.numero_cabina;
        textContainer.appendChild(span);

        item.appendChild(textContainer);

        /*var span=document.createElement("span");
        span.setAttribute("style","margin-left:auto;box-sizing:border-box;padding-left:10px;padding-right:10px;height: 35px;line-height: 35px;background-color:#313131");
        span.innerHTML=cabina.codice_cabina;
        textContainer.appendChild(span);*/

        var progressBarContainer=document.createElement("div");
        progressBarContainer.setAttribute("class","cabine-item-progress-bar-container");

        var percentuale_pannelli_caricati=(cabina.pannelli_caricati*100)/cabina.totale_pannelli;

        var progressBar=document.createElement("div");
        progressBar.setAttribute("class","cabine-item-progress-bar");
        if(percentuale_pannelli_caricati==100)
            progressBar.setAttribute("style","width:"+percentuale_pannelli_caricati+"%;background-color: #70B085;");
        else
            progressBar.setAttribute("style","width:"+percentuale_pannelli_caricati+"%;background-color: #4C91CB;");
        progressBarContainer.appendChild(progressBar);

        item.appendChild(progressBarContainer);

        container.appendChild(item);

        i++;
    });

    Swal.close();
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
    container.innerHTML='<div id="listInnerContainerSpinner"><i class="fad fa-spinner fa-spin"></i></div>';

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

    pannelloSelezionato=null;
    facciaPannelloSelezionato=null;
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
        item.setAttribute("onclick","checkPannelloPrecedente("+pannello.id_distinta+","+pannello.id_pannello+",'"+pannello.codice_pannello+"','"+pannello.configurazione+"')");

        var textContainer=document.createElement("div");
        textContainer.setAttribute("class","pannelli-item-text-container");

        var span=document.createElement("span");
        span.setAttribute("style","margin-left:10px;");
        span.innerHTML=pannello.codice_pannello+" ("+pannello.configurazione+")";
        textContainer.appendChild(span);

        if(pannello.elettrificato=="true")
        {
            var icon=document.createElement("i");
            icon.setAttribute("class","fas fa-bolt");
            icon.setAttribute("style","margin-left:auto;margin-right:10px");
            textContainer.appendChild(icon);
        }
        
        var span=document.createElement("span");
        span.setAttribute("class","pannelli-item-span-id_distinta");
        if(pannello.elettrificato=="true")
            span.setAttribute("style","box-sizing:border-box;padding-left:10px;padding-right:10px;height: 35px;line-height: 35px;background-color:#313131");
        else
            span.setAttribute("style","margin-left:auto;box-sizing:border-box;padding-left:10px;padding-right:10px;height: 35px;line-height: 35px;background-color:#313131");
        span.innerHTML="#"+pannello.id_distinta;
        textContainer.appendChild(span);

        item.appendChild(textContainer);

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

    Swal.close();
}
async function checkPannelloPrecedente(id_distinta,id_pannello,codice_pannello,configurazione)
{
    var pannelloObj=getFirstObjByPropValue(pannelli,"id_distinta",id_distinta);
    var pannelloPrecedente=await getPannelloPrecedente();
    if(pannelloPrecedente.elettrificato==pannelloObj.elettrificato)
        selectPannello(id_distinta,id_pannello,codice_pannello,configurazione);
    else
    {
		if(pannelloPrecedente.elettrificato!=undefined)
		{
			if(pannelloPrecedente.elettrificato=="true")
				var title="Il pannello precedente era elettrificato";
			else
				var title="Il pannello precedente non era elettrificato";

			Swal.fire
			({
				icon: 'warning',
				title,
				width:550,
				showCancelButton: true,
				background:"#404040",
				showConfirmButton: true,
				cancelButtonText: `Annulla`,
				confirmButtonText: `Prosegui`,
				onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="#ddd";document.getElementsByClassName("swal2-title")[0].style.fontSize="16px";document.getElementsByClassName("swal2-confirm")[0].style.fontSize="16px";document.getElementsByClassName("swal2-cancel")[0].style.fontSize="16px";document.getElementsByClassName("swal2-close")[0].style.outline="none";}
			}).then((result) =>
			{
				if (result.value)
					selectPannello(id_distinta,id_pannello,codice_pannello,configurazione);
			});
		}
		else
			selectPannello(id_distinta,id_pannello,codice_pannello,configurazione);
    }
}
function getPannelloPrecedente()
{
    return new Promise(function (resolve, reject) 
    {
        $.post("getPannelloPrecedenteCaricamento.php",
        function(response, status)
        {
            if(status=="success")
            {
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve({});
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve({});
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
                resolve({});
            }
        });
    });
}
function selectPannello(id_distinta,id_pannello,codice_pannello,configurazione)
{
    document.getElementById("messageCodicePannello").innerHTML="";
    document.getElementById("inputSearchCodicePannello").value="";

    pannelloSelezionato=id_distinta;
    facciaPannelloSelezionato="fronte";
    document.getElementById("labelId_distintaSelezionata").innerHTML="# : <b>"+id_distinta+"</b>";
    document.getElementById("labelPannelloSelezionato").innerHTML="PANNELLO : <b>"+codice_pannello+" ("+configurazione+")</b>";

    cleanPannelliItem();

    document.getElementById("pannelliItem"+id_distinta).style.boxShadow="0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";
    document.getElementById("pannelliItem"+id_distinta).style.backgroundColor="#494949";
    document.getElementById("pannelliItem"+id_distinta).style.color="#4C91CB";

    getPdf(codice_pannello);

    //stampaEtichettaPannello(id_distinta);
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
    if(pannelli.length>0)
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
                configurazione=pannello.configurazione;
            }
        });

        if(check)
        {
            checkPannelloPrecedente(id_distinta,id_pannello,codice_pannello,configurazione);
            document.getElementById("messageCodicePannello").innerHTML="";
        }
        else
        {
            document.getElementById("messageCodicePannello").innerHTML="<span style='color:#DA6969'>Pannello non trovato</span>";
        }
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
        var ordine_di_produzioneObj=getFirstObjByPropValue(ordini_di_produzione,"id_ordine_di_produzione",odpSelezionato);

        $.post("getPannelliCaricamento.php",
        {
            id_ordine_di_produzione:odpSelezionato,numero_cabina:cabinaSelezionata,produzione_per_cabina:ordine_di_produzioneObj.produzione_per_cabina
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
    facciaPannelloSelezionato=null;
    document.getElementById("labelId_distintaSelezionata").innerHTML="# :";
    document.getElementById("labelPannelloSelezionato").innerHTML="PANNELLO :";
    cleanPannelliItem();

    document.getElementById("pdfContainer").innerHTML="";
    iframe=null;

    document.getElementById("messageCodicePannello").innerHTML="";
    document.getElementById("inputSearchCodicePannello").value="";
}
function getAnagraficaDime()
{
    return new Promise(function (resolve, reject) 
    {
        $.post("getAnagraficaDime.php",
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
async function selezionaDima()
{
    if(pannelloSelezionato!=null)
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

		var anagrafica_dime=await getAnagraficaDime();

		var outerContainer=document.createElement("div");
		outerContainer.setAttribute("class","popup-dime-outer-container");

		var i=0;
		anagrafica_dime.forEach(dimaObj => 
		{
			if(!dimaObj.hidden)
			{
				var dimeItem=document.createElement("button");
				dimeItem.setAttribute("class","popup-dime-item");
				dimeItem.setAttribute("onclick","Swal.close();confermaSelectPannello("+dimaObj.NumeroDima+")");
				if(i==0)
					dimeItem.setAttribute("style","margin-top:0px");

				var span=document.createElement("span");
				span.innerHTML=dimaObj.descrizione;
				dimeItem.appendChild(span);

				var span=document.createElement("span");
				span.setAttribute("style","color:#4C91CB;font-weight:bold;margin-left:auto");
				span.innerHTML=dimaObj.NumeroDima;
				dimeItem.appendChild(span);
				
				outerContainer.appendChild(dimeItem);
				i++;
			}
		});

		Swal.fire
		({
			background:"#404040",
			title:"SCEGLI UNA DIMA",
			html:outerContainer.outerHTML,
			allowOutsideClick:true,
			showCloseButton:true,
			showConfirmButton:true,
			allowEscapeKey:true,
			showCancelButton:false,
			onOpen : function()
					{
						document.getElementsByClassName("swal2-title")[0].style.fontWeight="normal";
						document.getElementsByClassName("swal2-title")[0].style.fontSize="12px";
						document.getElementsByClassName("swal2-title")[0].style.color="#ddd";
						document.getElementsByClassName("swal2-title")[0].style.width="100%";
						document.getElementsByClassName("swal2-close")[0].style.width="40px";
						document.getElementsByClassName("swal2-close")[0].style.height="40px";
						document.getElementsByClassName("swal2-title")[0].style.margin="0px";
						document.getElementsByClassName("swal2-title")[0].style.marginTop="5px";
						document.getElementsByClassName("swal2-title")[0].style.fontFamily="'Montserrat',sans-serif";
						document.getElementsByClassName("swal2-title")[0].style.textAlign="left";
						document.getElementsByClassName("swal2-confirm")[0].style.display="none";
						document.getElementsByClassName("swal2-popup")[0].style.paddingBottom="0px";
						document.getElementsByClassName("swal2-popup")[0].style.paddingRight="0px";
						document.getElementsByClassName("swal2-popup")[0].style.paddingLeft="0px";
						document.getElementsByClassName("swal2-popup")[0].style.paddingTop="10px";
						document.getElementsByClassName("swal2-header")[0].style.paddingLeft="20px";
						document.getElementsByClassName("swal2-content")[0].style.padding="0px";
						document.getElementsByClassName("swal2-actions")[0].style.margin="0px";
					}
		});
        /*var pannelloObj=getFirstObjByPropValue(pannelli,"id_distinta",pannelloSelezionato);

        if(pannelloObj.ang==0)
            confermaSelectPannello(0);
        else
        {
            if(pannelloObj.ang>180)
            {
                if(pannelloObj.lung1>=pannelloObj.lung2)
                    confermaSelectPannello(1);
                else
                    confermaSelectPannello(2);
            }
            else
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

                var anagrafica_dime=await getAnagraficaDime();

                var outerContainer=document.createElement("div");
                outerContainer.setAttribute("class","popup-dime-outer-container");

                var i=0;
                anagrafica_dime.forEach(dimaObj => 
                {
                    if(!dimaObj.hidden)
                    {
                        var dimeItem=document.createElement("button");
                        dimeItem.setAttribute("class","popup-dime-item");
                        dimeItem.setAttribute("onclick","Swal.close();confermaSelectPannello("+dimaObj.NumeroDima+")");
                        if(i==0)
                            dimeItem.setAttribute("style","margin-top:0px");
    
                        var span=document.createElement("span");
                        span.innerHTML=dimaObj.descrizione;
                        dimeItem.appendChild(span);

                        var span=document.createElement("span");
                        span.setAttribute("style","color:#4C91CB;font-weight:bold;margin-left:auto");
                        span.innerHTML=dimaObj.NumeroDima;
                        dimeItem.appendChild(span);
                        
                        outerContainer.appendChild(dimeItem);
                        i++;
                    }
                });

                Swal.fire
                ({
                    background:"#404040",
                    title:"SCEGLI UNA DIMA",
                    html:outerContainer.outerHTML,
                    allowOutsideClick:true,
                    showCloseButton:true,
                    showConfirmButton:true,
                    allowEscapeKey:true,
                    showCancelButton:false,
                    onOpen : function()
                            {
                                document.getElementsByClassName("swal2-title")[0].style.fontWeight="normal";
                                document.getElementsByClassName("swal2-title")[0].style.fontSize="12px";
                                document.getElementsByClassName("swal2-title")[0].style.color="#ddd";
                                document.getElementsByClassName("swal2-title")[0].style.width="100%";
                                document.getElementsByClassName("swal2-close")[0].style.width="40px";
                                document.getElementsByClassName("swal2-close")[0].style.height="40px";
                                document.getElementsByClassName("swal2-title")[0].style.margin="0px";
                                document.getElementsByClassName("swal2-title")[0].style.marginTop="5px";
                                document.getElementsByClassName("swal2-title")[0].style.fontFamily="'Montserrat',sans-serif";
                                document.getElementsByClassName("swal2-title")[0].style.textAlign="left";
                                document.getElementsByClassName("swal2-confirm")[0].style.display="none";
                                document.getElementsByClassName("swal2-popup")[0].style.paddingBottom="0px";
                                document.getElementsByClassName("swal2-popup")[0].style.paddingRight="0px";
                                document.getElementsByClassName("swal2-popup")[0].style.paddingLeft="0px";
                                document.getElementsByClassName("swal2-popup")[0].style.paddingTop="10px";
                                document.getElementsByClassName("swal2-header")[0].style.paddingLeft="20px";
                                document.getElementsByClassName("swal2-content")[0].style.padding="0px";
                                document.getElementsByClassName("swal2-actions")[0].style.margin="0px";
                            }
                });
            }
        }*/
    }
}
function confermaSelectPannello(NumeroDima)
{
    if(pannelloSelezionato!=null)
    {
        var pannelloObj=getFirstObjByPropValue(pannelli,"id_distinta",pannelloSelezionato);

        $.post("caricaPannello.php",
        {
            id_distinta:pannelloSelezionato,
            faccia:facciaPannelloSelezionato,
            id_utente,
            stazione:stazione.id_stazione,
            NumeroDima
        },
        function(response, status)
        {
            if(status=="success")
            {
                console.log(response);
                if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                {
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                }
                else
                {
                    if(pannelloObj.configurazione=="BF" && facciaPannelloSelezionato=="fronte")
                    {
                        Swal.fire
                        ({
                            icon:"success",
                            title: "Configurazione non supportata",
                            background:"#404040",
                            showCloseButton:false,
                            showConfirmButton:false,
                            allowOutsideClick:false,
                            onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="white";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";document.getElementsByClassName("swal2-close")[0].style.outline="none";},
                        });
                    }
                    else
                    {
                        document.getElementById("pannelliItem"+pannelloSelezionato).remove();
                        var index=0;
                        pannelli.forEach(pannello =>
                        {
                            if(pannello.id_distinta==pannelloSelezionato)
                                pannelli.splice(index, 1);
                            index++;
                        });
                        document.getElementById("containerNItems").innerHTML="<span><b style='letter-spacing:1px'>"+pannelli.length+"</b> righe</span>";
                        if(pannelli.length>0)
                            document.getElementsByClassName("pannelli-item")[document.getElementsByClassName("pannelli-item").length-1].style.marginBottom="0px";
                        cancelSelectPannello();
                    }
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
        case "pannelli":
            var ordine_di_produzioneObj=getFirstObjByPropValue(ordini_di_produzione,"id_ordine_di_produzione",odpSelezionato);

            if(ordine_di_produzioneObj.produzione_per_cabina)
            {
                document.getElementById("labelCabinaSelezionata").parentElement.style.display="flex";
                getListCabine();
            }
            else
            {
                document.getElementById("labelCabinaSelezionata").parentElement.style.display="none";
                getListOrdiniDiProduzione();
            }
        break;
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
function getPopupRiavviaLinea()
{
    Swal.fire
	({
		icon: 'warning',
		title: "Vuoi svuotare la linea e riavviare tutti i programmi?",
		width:550,
		showCancelButton: true,
        background:"#404040",
		showConfirmButton: true,
		cancelButtonText: `Annulla`,
		confirmButtonText: `Riavvia linea`,
        onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="#ddd";document.getElementsByClassName("swal2-title")[0].style.fontSize="16px";document.getElementsByClassName("swal2-confirm")[0].style.fontSize="16px";document.getElementsByClassName("swal2-cancel")[0].style.fontSize="16px";document.getElementsByClassName("swal2-close")[0].style.outline="none";}
	}).then((result) =>
	{
		if (result.value)
		{
            $.get("riavviaLinea.php",
            function(response, status)
            {
                if(status=="success")
                {
                    if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
                    {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                    }
                }
            });
		}
	});
}
function getPannelliLinea()
{
    return new Promise(function (resolve, reject) 
    {
        $.post("getPannelliLinea.php",
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
                        resolve({});
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
                resolve({});
            }
        });
    });
}
async function getPopupEliminaPannelli()
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

    var pannelli_linea=await getPannelliLinea();
    if(pannelli_linea.length==0)
    {
        Swal.fire
        ({
            icon: 'warning',
            title: "NESSUN PANNELLO IN LINEA",
            showCancelButton: false,
            showCloseButton:true,
            background:"#404040",
            showConfirmButton: false,
            onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="#ddd";document.getElementsByClassName("swal2-title")[0].style.fontSize="16px";document.getElementsByClassName("swal2-confirm")[0].style.fontSize="16px";document.getElementsByClassName("swal2-cancel")[0].style.fontSize="16px";document.getElementsByClassName("swal2-close")[0].style.outline="none";}
        });
    }
    else
    {
        var outerContainer=document.createElement("div");
        outerContainer.setAttribute("class","popup-elimina-pannelli-outer-container");
    
        var i=0;
        pannelli_linea.forEach(pannello => 
        {
            var pannelloItem=document.createElement("button");
            pannelloItem.setAttribute("class","popup-elimina-pannelli-item");
            pannelloItem.setAttribute("onclick","eliminaPannello("+pannello.id_distinta+")");
            if(i==0)
                pannelloItem.setAttribute("style","margin-top:0px");
    
            var span=document.createElement("span");
            span.innerHTML=pannello.codice_pannello;
            pannelloItem.appendChild(span);
    
            var span=document.createElement("span");
            span.setAttribute("style","color:#4C91CB;font-weight:bold;margin-left:auto");
            span.innerHTML=pannello.id_distinta;
            pannelloItem.appendChild(span);
            
            outerContainer.appendChild(pannelloItem);
            i++;
        });
    
        Swal.fire
        ({
            background:"#404040",
            title:"CLICCA SU UN PANNELLO PER ELIMINARLO",
            html:outerContainer.outerHTML,
            allowOutsideClick:true,
            showCloseButton:true,
            showConfirmButton:true,
            allowEscapeKey:true,
            showCancelButton:false,
            onOpen : function()
                    {
                        document.getElementsByClassName("swal2-title")[0].style.fontWeight="normal";
                        document.getElementsByClassName("swal2-title")[0].style.fontSize="12px";
                        document.getElementsByClassName("swal2-title")[0].style.color="#ddd";
                        document.getElementsByClassName("swal2-title")[0].style.width="100%";
                        document.getElementsByClassName("swal2-close")[0].style.width="40px";
                        document.getElementsByClassName("swal2-close")[0].style.height="40px";
                        document.getElementsByClassName("swal2-title")[0].style.margin="0px";
                        document.getElementsByClassName("swal2-title")[0].style.marginTop="5px";
                        document.getElementsByClassName("swal2-title")[0].style.fontFamily="'Montserrat',sans-serif";
                        document.getElementsByClassName("swal2-title")[0].style.textAlign="left";
                        document.getElementsByClassName("swal2-confirm")[0].style.display="none";
                        document.getElementsByClassName("swal2-popup")[0].style.paddingBottom="0px";
                        document.getElementsByClassName("swal2-popup")[0].style.paddingRight="0px";
                        document.getElementsByClassName("swal2-popup")[0].style.paddingLeft="0px";
                        document.getElementsByClassName("swal2-popup")[0].style.paddingTop="10px";
                        document.getElementsByClassName("swal2-header")[0].style.paddingLeft="20px";
                        document.getElementsByClassName("swal2-content")[0].style.padding="0px";
                        document.getElementsByClassName("swal2-actions")[0].style.margin="0px";
                    }
        });
    }
}
function setLogoutStazioni(id_stazioni)
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

    var JSONid_stazioni=JSON.stringify(id_stazioni);
    $.get("setLogoutStazioni.php",{JSONid_stazioni},
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
				Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
            }
        }
    });
}
function svuotaLinea()
{
    $.get("svuotaLinea.php",
    function(response, status)
    {
        if(status=="success")
        {
            if(response.toLowerCase().indexOf("error")>-1 || response.toLowerCase().indexOf("notice")>-1 || response.toLowerCase().indexOf("warning")>-1)
            {
				Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
            }
        }
    });
}