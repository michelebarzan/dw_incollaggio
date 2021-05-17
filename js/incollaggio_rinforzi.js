var iframe;
var id_utente;
var interval;
var frequenza_aggiornamento_dati_linea;
var stazione;
var stazioni;
var intervalOverflowPdf1;
var intervalOverflowPdf2;
var pannello;
var drawing3DObj;
var isDrawing3DObjSpinning;

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

    displayPannello();
    
    interval = setInterval(intervalFunctions, frequenza_aggiornamento_dati_linea);
});
async function displayPannello()
{
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

        console.log(pannello)

        getDrawing(pannello);
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
        case 116:event.preventDefault();break;//F5
        case 117:event.preventDefault();break;//F6
        case 118:event.preventDefault();break;//F7
        case 119:event.preventDefault();break;//F8
        case 120:event.preventDefault();break;//F9
        case 121:event.preventDefault();break;//F10
        case 122:event.preventDefault();break;//F11
        case 123:event.preventDefault();break;//F12
        default:break;
    }
});
async function getDrawing(pannello)
{
    var container=document.getElementById("drawingInnerContainer");
    container.innerHTML="";

    var containerWidth=container.offsetWidth;
    var containerHeight=container.offsetHeight;

    var scale="1:2.2";

    //------------------------------------------------------3D------------------------------------------------------------

    var lung1=getScaledMeasure(pannello.lung1,scale);
    var lung2=getScaledMeasure(pannello.lung2,scale);
    var halt=getScaledMeasure(pannello.halt,scale);

    var altezza_pannello=halt;
    if(lung1>lung2)//if(pannello.ruotato)???
    {
        var larghezza_lato_orrizzontale=lung1;
        var larghezza_lato_verticale=lung2;
    }
    else
    {
        var larghezza_lato_orrizzontale=lung2;
        var larghezza_lato_verticale=lung1;
    }

    var canvas=document.createElement("canvas");
    canvas.setAttribute("class","zdog-canvas");
    canvas.setAttribute("width","1200");
    canvas.setAttribute("height","830");
    container.appendChild(canvas);

    const drawing3DTAU = Zdog.TAU;
    isDrawing3DObjSpinning = true;

    drawing3DObj = new Zdog.Illustration
    ({
        element: '.zdog-canvas',
        dragRotate: true,
        onDragStart: function()
        {
            isDrawing3DObjSpinning = false;
        },
    });

    var lato_orrizzontale = new Zdog.Rect
    ({
        addTo: drawing3DObj,
        width: altezza_pannello,
        height: larghezza_lato_orrizzontale,
        stroke: 2,
        translate:
        {
            x:0,
            z:0,
            y:0
        },
        color: 'gray',
        fill: true
    });

    if(larghezza_lato_verticale>0)
    {
        console.log(drawing3DTAU);
        var lato_verticale = new Zdog.Rect
        ({
            addTo: drawing3DObj,
            width: altezza_pannello,
            height: larghezza_lato_verticale,
            stroke: 2,
            translate: 
            {
                x:0,
                y:0-(larghezza_lato_orrizzontale/2),
                z:larghezza_lato_verticale/2
            },
            rotate:
            {
                x: drawing3DTAU/4
            },
            color: '#bbb',
            fill: true
        });
    }
    
    //rinforzi
    pannello.rinforzi.forEach(rinforzo =>
    {
        //console.log(rinforzo);

        rinforzo.largezza=80;//prenderlo da query???

        var lunghezza=getScaledMeasure(rinforzo.lunghezza,scale);
        var posx=getScaledMeasure(rinforzo.posx,scale);//asse del rinforzo
        var posy=getScaledMeasure(rinforzo.posy,scale);//inizio del rinforzo
        var larghezza_rinforzo=getScaledMeasure(rinforzo.largezza,scale);
        if(rinforzo.vh=="VER")
        {
            if(posx<larghezza_lato_orrizzontale)
            {
                //il rinforzo verticale si trova sul lato orrizzontale
                var rinforzo_verticale = new Zdog.Rect
                ({
                    addTo: drawing3DObj,
                    width: lunghezza,
                    height: larghezza_rinforzo,//larghezza del rinforzo
                    stroke: 2,
                    translate: 
                    {
                        x:(altezza_pannello/2)-(lunghezza/2)-posy,
                        y:(larghezza_lato_orrizzontale/2)-(posx/2)-(larghezza_rinforzo/2),
                        z:2
                    },
                    color: '#DA6969',
                    fill: true
                });
            }
            else
            {
                //il rinforzo verticale si trova sul lato verticale
            }
        }
        else
        {
            var rinforzo_orrizontale = new Zdog.Shape
            ({
                addTo: drawing3DObj,
                path:
                [
                    {
                        x:-40,
                        y:0,
                        z:0
                    },
                    {
                        x:-40,
                        y:0,
                        z:0
                    }
                ],
                stroke: 2,
                color: '#70B085',
            });
        }
        
    });

    //drawing3DObj.rotate.z = -0.25;
    drawing3DObj.updateRenderGraph();

    animateDrawing3D();

    /*
    
    ------------------------------------------------------2D------------------------------------------------------------
    
    var svg=document.createElementNS("http://www.w3.org/2000/svg", "svg");

    var lung1=getScaledMeasure(pannello.lung1,scale);
    var lung2=getScaledMeasure(pannello.lung2,scale);
    var halt=getScaledMeasure(pannello.halt,scale);

    console.log(lung1);
    console.log(lung2);
    console.log(halt);

    //pannello
    var Y_rettangolo1=lung1;
	var Y_rettangolo2=lung1-lung2;

    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute("class","svg-rect-pannello");
    rect.setAttribute("x","50");
    rect.setAttribute("y",Y_rettangolo2);
    rect.setAttribute("width",halt);
    rect.setAttribute("height",lung2);
    svg.appendChild(rect);

    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute("class","svg-rect-pannello");
    rect.setAttribute("x","50");
    rect.setAttribute("y",Y_rettangolo1);
    rect.setAttribute("width",halt);
    rect.setAttribute("height",lung1);
    svg.appendChild(rect);

    //rinforzi
    pannello.rinforzi.forEach(rinforzo =>
    {
        var x1=50+rinforzo.posy;
		var y1=490-rinforzo.posx;
		var x2=x1;
        y2=490-rinforzo.posx-rinforzo.lunghezza;
        var x1Text=x1+8;
        if(lung2<50)
            var y1Text=480-lung1-lung2;
		else
            var y1Text=480-lung1;

        var line=document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute("class","svg-line-rinforzo");
        line.setAttribute("x1",x1);
        line.setAttribute("y1",y1);
        line.setAttribute("x2",x2);
        line.setAttribute("y2",y2);
        svg.appendChild(line);
    });

    container.appendChild(svg);*/
}
function animateDrawing3D()
{
    if(drawing3DObj!=null)
    {
        //drawing3DObj.rotate.x += isDrawing3DObjSpinning ? 0.003 : 0;
        drawing3DObj.updateRenderGraph();
        requestAnimationFrame( animateDrawing3D );
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
function getScaledMeasure(measure,scale)
{
    var scaleFactor1=parseFloat(scale.split(":")[0]);
    var scaleFactor2=parseFloat(scale.split(":")[1]);

    return (measure*scaleFactor1)/scaleFactor2;
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
function eliminaPannello()
{
    /*if(pannello!=null)
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

        $.get("eliminaPannello.php",
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
    }*/
}