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
var NumeroDimaPannelloSelezionato;
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
    NumeroDimaPannelloSelezionato=null;
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
    NumeroDimaPannelloSelezionato=null;
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
    NumeroDimaPannelloSelezionato=null;
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

    var pannelloObj=getFirstObjByPropValue(pannelli,"id_distinta",id_distinta);
    var pannelloPrecedente=await getPannelloPrecedente();

    Swal.close();
    
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
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #1",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve({});
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #2",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve({});
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #3",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
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
async function getPannelloByBarcode(input)
{
    var value = input.value;
    
    input.value="";
    document.getElementById("messageCodicePannello").innerHTML="";

    if(view=="pannelli")
    {
        if(pannelli.length>0)
        {
            if(!isNaN(value))
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

                document.getElementById("messageCodicePannello").innerHTML="<i class='fad fa-spinner-third fa-spin' style='color:#ddd'></i>";

                var id_distinta = parseInt(value);

                var id_distinta_incollaggio = [];
                
                var error = false;

                var responseString = await getIdDistintaIncollaggio(id_distinta);
                if(responseString.toLowerCase().indexOf("error")>-1 || responseString.toLowerCase().indexOf("warning")>-1 || responseString.toLowerCase().indexOf("notice")>-1)
                    error = true;
                else
                    try {id_distinta_incollaggio = JSON.parse(responseString);} catch (err) {error = true;}

                Swal.close();

                if(id_distinta_incollaggio.length > 0)
                {
                    var found=false;
                    var codice_pannello;
                    var id_distinta;
                    var id_pannello;
                    var configurazione;

                    for (let index = 0; index < id_distinta_incollaggio.length; index++)
                    {
                        const id_distinta_incollaggio_lcl = id_distinta_incollaggio[index];
                        
                        var pannelloObj = pannelli.filter(function (pannello_lcl) {return pannello_lcl.id_distinta == id_distinta_incollaggio_lcl})[0];

                        if(pannelloObj != undefined)
                        {
                            found = true;
                            codice_pannello=pannelloObj.codice_pannello;
                            id_distinta=pannelloObj.id_distinta;
                            id_pannello=pannelloObj.id_pannello;
                            configurazione=pannelloObj.configurazione;

                            break;
                        }
                    }
    
                    if(found)
                    {
                        checkPannelloPrecedente(id_distinta,id_pannello,codice_pannello,configurazione);
                        document.getElementById("messageCodicePannello").innerHTML="";
                    }
                    else
                    {
                        document.getElementById("messageCodicePannello").innerHTML="<span style='color:#DA6969'>Pannello non trovato</span>";
                    }
                }
                else
                    document.getElementById("messageCodicePannello").innerHTML="<span style='color:#DA6969'>Pannello non trovato</span>";
            }
        }
    }
}
function getIdDistintaIncollaggio(id_distinta)
{
    return new Promise(function (resolve, reject) 
    {
        $.post("getIdDistintaIncollaggio.php",{id_distinta},
        function(response, status)
        {
            if(status=="success")
            {
                console.log(response);
                resolve(response);
            }
            else
                resolve("error");
        });
    });
}
function keyUpInputCodicePannello(input)
{
    /*if(view=="pannelli")
    {
        var value=input.value;console.log(value.length);

        if(isNaN(value))
        {
            if(value.length>7)
            {
                input.value="";
                
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
        }
        else
        {
            var pannelloObj = pannelli.filter(function (pannello_lcl) {return pannello_lcl.id_distinta == parseInt(value)})[0];
            
            if(pannelloObj != undefined)
            {
                input.value="";

                value = pannelloObj.codice_pannello;
                
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
    }
    else
    {
        input.value="";
    }*/
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
    iframe.setAttribute("src","http://"+server_adress+":"+server_port+"/dw_mes_pdf/pdf.js/web/viewer.html?file=pdf/pannelli/"+fileName+".pdf");
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
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #4",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #5",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #6",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
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
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #7",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #8",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #9",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
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
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #10",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #11",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #12",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
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
    NumeroDimaPannelloSelezionato=null;
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
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #13",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #14",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve([]);
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #15",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
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

        var pannelloObj=getFirstObjByPropValue(pannelli,"id_distinta",pannelloSelezionato);

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
				if(i==0)
					dimeItem.setAttribute("style","margin-top:0px");


                var span=document.createElement("span");
                span.setAttribute("style","color:#4C91CB;font-weight:bold;margin-right:10px");
                span.innerHTML=dimaObj.NumeroDima;
                dimeItem.appendChild(span);

				var span=document.createElement("span");
				span.innerHTML=dimaObj.descrizione;
				dimeItem.appendChild(span);

                if(dimaObj.auto_rotazione && pannelloObj.lung2 > 0 && pannelloObj.lung2 < pannelloObj.lung1)
                {
                    dimeItem.setAttribute("onclick","Swal.close();confermaSelectPannello("+dimaObj.NumeroDima+",true)");

                    var span=document.createElement("span");
                    span.setAttribute("style","margin-left:auto");
                    span.innerHTML="PANNELLO RUOTATO";
                    dimeItem.appendChild(span);
                }
                else
                    dimeItem.setAttribute("onclick","Swal.close();confermaSelectPannello("+dimaObj.NumeroDima+",false)");
				
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
}
async function confermaSelectPannello(NumeroDima,ruotato)
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

        NumeroDimaPannelloSelezionato = NumeroDima;
        var pannelloObj=getFirstObjByPropValue(pannelli,"id_distinta",pannelloSelezionato);

        var responseCaricaPannello = await caricaPannello(pannelloSelezionato,facciaPannelloSelezionato,id_utente,stazione.id_stazione,NumeroDimaPannelloSelezionato,ruotato);
        if(responseCaricaPannello.toLowerCase().indexOf("error")>-1 || responseCaricaPannello.toLowerCase().indexOf("notice")>-1 || responseCaricaPannello.toLowerCase().indexOf("warning")>-1)
        {
            Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #16",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
            console.log(responseCaricaPannello);
        }
        else
        {
            Swal.close();
            if(pannelloObj.configurazione=="BF" && facciaPannelloSelezionato=="fronte")
            {
                Swal.fire
                ({
                    icon:"warning",
                    title: `PANNELLO FRONTE ${pannelloObj.codice_pannello} CARICATO`,
                    background:"#404040",
                    width:"700",
                    showCloseButton:false,
                    showConfirmButton:true,
                    showCancelButton:true,
                    allowOutsideClick:false,
                    confirmButtonText: `CARICA RETRO`,
                    cancelButtonText:"NON CARICARE RETRO",
                    onOpen : function()
                            {
                                document.getElementsByClassName("swal2-title")[0].style.color="#71B085";
                                document.getElementsByClassName("swal2-title")[0].style.fontSize="18px";
                                document.getElementsByClassName("swal2-title")[0].style.marginBottom="20px";
                                document.getElementsByClassName("swal2-title")[0].style.fontWeight="bold";
                                document.getElementsByClassName("swal2-title")[0].style.letterSpacing="1px";

                                document.getElementsByClassName("swal2-close")[0].style.outline="none";
                            },
                }).then(async (result) =>
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

                        var responseCaricaPannello = await caricaPannello(pannelloSelezionato,`retro`,id_utente,stazione.id_stazione,NumeroDimaPannelloSelezionato,ruotato);
                        if(responseCaricaPannello.toLowerCase().indexOf("error")>-1 || responseCaricaPannello.toLowerCase().indexOf("notice")>-1 || responseCaricaPannello.toLowerCase().indexOf("warning")>-1)
                        {
                            Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #17",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                            console.log(responseCaricaPannello);
                        }
                        else
                        {
                            Swal.close();
                            successCaricaPannello();
                        }
                    }
                    else
                        successCaricaPannello();
                });
            }
            else
                successCaricaPannello();
        }
    }
}
function successCaricaPannello()
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
function caricaPannello(id_distinta,faccia,id_utente,stazione,NumeroDima,ruotato)
{
    return new Promise(function (resolve, reject) 
    {
        $.post("caricaPannello.php",
        {
            id_distinta,faccia,id_utente,stazione,NumeroDima,ruotato
        },
        function(response, status)
        {
            if(status=="success")
                resolve(response);
        });
    });
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
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #18",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
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
                    Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #19",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                    console.log(response);
                    resolve([]);
                }
                else
                {
                    try {
                        resolve(JSON.parse(response));
                    } catch (error) {
                        Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #20",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                        console.log(response);
                        resolve({});
                    }
                }
            }
            else
            {
                Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #21",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
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
				Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #22",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
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
				Swal.fire({icon:"error",title: "Errore. Se il problema persiste contatta l' amministratore #23",onOpen : function(){document.getElementsByClassName("swal2-title")[0].style.color="gray";document.getElementsByClassName("swal2-title")[0].style.fontSize="14px";}});
                console.log(response);
            }
        }
    });
}
function getPopupSearch()
{
    var outerContainer=document.createElement("div");
    outerContainer.setAttribute("class","popup-search-outer-container");

    var title=document.createElement("span");
    title.setAttribute("class","popup-search-title");
    title.innerHTML="Ricerca";
    outerContainer.appendChild(title);

    var inputContainer=document.createElement("div");
    inputContainer.setAttribute("class","popup-search-input-container");

    var input = document.createElement("input");
    input.setAttribute("type","text");
    input.setAttribute("disabled","disabled");
    input.setAttribute("id","inputPopupSearch");
    input.setAttribute("style","margin-left:7.5px;margin-right:7.5px");
    inputContainer.appendChild(input);
    
    var button = document.createElement("button");
    button.setAttribute("onclick","document.getElementById('inputPopupSearch').value=''");
    button.setAttribute("style","margin-right:7.5px");
    button.innerHTML='<i class="fas fa-times"></i>';
    inputContainer.appendChild(button);

    var button = document.createElement("button");
    button.setAttribute("onclick","searchView()");
    button.setAttribute("style","margin-right:7.5px");
    button.innerHTML='<i class="fas fa-search"></i>';
    inputContainer.appendChild(button);

    outerContainer.appendChild(inputContainer);

    var numpad=document.createElement("div");
    numpad.setAttribute("class","popup-search-keypad");
    var button=document.createElement("button");button.innerHTML="<span>1</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('1')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>2</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('2')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>3</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('3')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>4</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('4')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>5</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('5')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>6</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('6')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>7</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('7')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>8</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('8')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>9</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('9')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>0</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('0')");numpad.appendChild(button);

    var button=document.createElement("button");button.innerHTML="<span>Q</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('Q')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>W</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('W')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>E</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('E')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>R</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('R')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>T</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('T')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>Y</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('Y')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>U</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('U')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>I</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('I')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>O</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('O')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>P</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('P')");numpad.appendChild(button);

    var button=document.createElement("button");button.innerHTML="<span>A</span>";button.setAttribute("style","margin-left:32.5px");button.setAttribute("onclick","clickNumpadButtonPopupSearch('A')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>S</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('S')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>D</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('D')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>F</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('F')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>G</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('G')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>H</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('H')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>J</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('J')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>K</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('K')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>L</span>";button.setAttribute("style","margin-right:32.5px");button.setAttribute("onclick","clickNumpadButtonPopupSearch('L')");numpad.appendChild(button);

    var button=document.createElement("button");button.innerHTML="<span>Z</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('Z')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>X</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('X')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>C</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('C')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>V</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('V')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>B</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('B')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>N</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('N')");numpad.appendChild(button);
    var button=document.createElement("button");button.innerHTML="<span>M</span>";button.setAttribute("onclick","clickNumpadButtonPopupSearch('M')");numpad.appendChild(button);

    outerContainer.appendChild(numpad);

    Swal.fire
    ({
        html:outerContainer.outerHTML,
        showCloseButton: true,
        showConfirmButton:false,
        showCancelButton:false,
        background:"#353535",
        onOpen : function()
                {
                    document.body.classList.remove("swal2-height-auto");
                    document.getElementsByClassName("swal2-content")[0].style.padding="0px";
                    document.getElementsByClassName("swal2-popup")[0].style.padding="0px";
                    document.getElementsByClassName("swal2-popup")[0].style.width="665px";
                    document.getElementsByClassName("swal2-content")[0].style.boxShadow="0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";
                    document.activeElement.blur()
                },
    }).then((result) =>
    {
        searchView();
    });
}
function clickNumpadButtonPopupSearch(n)
{
    document.getElementById("inputPopupSearch").value+=n;
}
function searchView()
{
    var value = document.getElementById("inputPopupSearch").value;

    Swal.close();

    var items = document.getElementById("listInnerContainer").getElementsByTagName("button");
    var count = 0;
    for (let index = 0; index < items.length; index++)
    {
        const item = items[index];

        if(value == "" || value == null)
            item.style.display="";
        else
        {
            if(item.textContent.toLocaleLowerCase().replaceAll(" ","").replaceAll("-","").replaceAll("_","").replaceAll("(","").replaceAll(")","").indexOf(value.toLocaleLowerCase()) > -1)
            {
                item.style.display="";
                count++;
            }
            else
                item.style.display="none";
        }
    }

    if(value == "" || value == null)
        document.getElementById("containerNItems").innerHTML="<span><b style='letter-spacing:1px'>"+items.length+"</b> righe</span>";
    else
        document.getElementById("containerNItems").innerHTML="<span><b style='letter-spacing:1px'>"+count+"</b> righe</span>";
}