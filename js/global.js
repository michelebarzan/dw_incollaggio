var scale="1:2.35";
var svg_height=830;
var svg_width=1180;
var distanza_quota_pannello=40;
var limite_recupero_lana=200;
var lunghezza_trattino_quote=10;
var distanza_testo_linea_quota=7;
var svgDefaultTextPadding=4;
var stroke_width_lana_fresatura=15;

function setCookie(name,value)
{
    $.post("setCookie.php",{name,value},
    function(response, status)
    {
        if(status!="success")
            console.log(status);
    });
}
function getCookie(name)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getCookie.php",{name},
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
function getSessionValue(name)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getSessionValue.php",{name},
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
function setSessionValue(name,value)
{

}
function getServerValue(name)
{
    return new Promise(function (resolve, reject) 
    {
        $.get("getServerValue.php",{name},
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
function getFirstObjByPropValue(array,prop,propValue)
{
    var return_item;
    array.forEach(function(item)
    {
        if(item[prop]==propValue)
        {
            return_item= item;
        }
    });
    return return_item;
}
function logout()
{
    $.get("logout.php",
    function(response, status)
    {
        window.location = 'login.html';
    });
}
/*--------------------------------------------------------------------------------------------------*/
async function getDrawingLamiera()
{
    var container=document.getElementById("drawingInnerContainer");
    container.innerHTML="";

    $(".drawing-lamiera-legenda-button").remove();
    $(".drawing-lana-legenda-button").remove();
    $("#messaggioRecuperoLanaButton").remove();

    var containerWidth=container.offsetWidth;
    var containerHeight=container.offsetHeight;

    var lung1=getScaledMeasure(pannello.lung1);
    var lung2=getScaledMeasure(pannello.lung2);
    var halt=getScaledMeasure(pannello.halt);

    var altezza_pannello=halt;
    var larghezza_lato_orrizzontale=lung1;
    var larghezza_lato_verticale=lung2;
    
    var svg=document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id","drawingSvg");
    container.appendChild(svg);

    var svg=document.getElementById("drawingSvg");    
    
    var x_pannello=(svg_width/2)-(altezza_pannello/2);
    var y_pannello=(svg_height/2)-((larghezza_lato_verticale+larghezza_lato_orrizzontale)/2);

    //pannello
    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute("style","fill:gray;stroke:black;stroke-width:1;");
    rect.setAttribute("x",x_pannello);
    rect.setAttribute("y",y_pannello);
    rect.setAttribute("width",altezza_pannello);
    rect.setAttribute("height",larghezza_lato_verticale);
    svg.appendChild(rect);

    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute("style","fill:gray;stroke:black;stroke-width:1;");
    rect.setAttribute("x",x_pannello);
    rect.setAttribute("y",y_pannello+larghezza_lato_verticale);
    rect.setAttribute("width",altezza_pannello);
    rect.setAttribute("height",larghezza_lato_orrizzontale);
    svg.appendChild(rect);

    //quota altezza pannello
    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello);
    line.setAttribute("y1",y_pannello-distanza_quota_pannello);
    line.setAttribute("x2",x_pannello+altezza_pannello);
    line.setAttribute("y2",y_pannello-distanza_quota_pannello);
    svg.appendChild(line);

    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello);
    line.setAttribute("y1",y_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
    line.setAttribute("x2",x_pannello);
    line.setAttribute("y2",y_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
    svg.appendChild(line);

    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello+altezza_pannello);
    line.setAttribute("y1",y_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
    line.setAttribute("x2",x_pannello+altezza_pannello);
    line.setAttribute("y2",y_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
    svg.appendChild(line);

    var text=document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute("style","fill:white");
    text.setAttribute("x",(x_pannello+altezza_pannello)/2);
    text.setAttribute("y",y_pannello-distanza_quota_pannello-distanza_testo_linea_quota);
    text.innerHTML=roundQuoteValue(pannello.halt);
    svg.appendChild(text);

    //quote larghezza pannello
    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello-distanza_quota_pannello);
    line.setAttribute("y1",y_pannello);
    line.setAttribute("x2",x_pannello-distanza_quota_pannello);
    line.setAttribute("y2",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
    svg.appendChild(line);

    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
    line.setAttribute("y1",y_pannello);
    line.setAttribute("x2",x_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
    line.setAttribute("y2",y_pannello);
    svg.appendChild(line);

    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
    line.setAttribute("y1",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
    line.setAttribute("x2",x_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
    line.setAttribute("y2",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
    svg.appendChild(line);

    if(larghezza_lato_verticale>0)
    {
        var line=document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute("style","stroke:white;stroke-width:1;");
        line.setAttribute("x1",x_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
        line.setAttribute("y1",y_pannello+larghezza_lato_verticale);
        line.setAttribute("x2",x_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
        line.setAttribute("y2",y_pannello+larghezza_lato_verticale);
        svg.appendChild(line);

        var text=document.createElementNS('http://www.w3.org/2000/svg','text');
        text.setAttribute("style","fill:white;");
        text.setAttribute("id","drawingQuotaLung2");
        text.innerHTML=roundQuoteValue(pannello.lung2);
        svg.appendChild(text);
        document.getElementById("drawingQuotaLung2").setAttribute("x",x_pannello-distanza_quota_pannello-distanza_testo_linea_quota-(document.getElementById("drawingQuotaLung2").getBBox().width));
        document.getElementById("drawingQuotaLung2").setAttribute("y",y_pannello+(larghezza_lato_verticale)/2+((document.getElementById("drawingQuotaLung2").getBBox().height-svgDefaultTextPadding)/2));
    }

    var text=document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute("style","fill:white;");
    text.setAttribute("id","drawingQuotaLung1");
    text.innerHTML=roundQuoteValue(pannello.lung1);
    svg.appendChild(text);
    document.getElementById("drawingQuotaLung1").setAttribute("x",x_pannello-distanza_quota_pannello-distanza_testo_linea_quota-(document.getElementById("drawingQuotaLung1").getBBox().width));
    document.getElementById("drawingQuotaLung1").setAttribute("y",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale)/2+((document.getElementById("drawingQuotaLung1").getBBox().height-svgDefaultTextPadding)/2));

    //rinforzi
    var i=1;
    var quote_rappresentate=[];
    pannello.rinforzi.forEach(rinforzo =>
    {
        //console.log(rinforzo);
        switch (rinforzo.codice_materia_prima)
        {
            case "R1":
                rinforzo.colore="#85D3D5";
            break;
            case "R69":
                rinforzo.colore="#C7CEEA";
            break;
            case "R74":
                rinforzo.colore="#F4F4E0";
            break;
            case "R7":
                rinforzo.colore="#ADB3DB";
            break;
            case "R65":
                rinforzo.colore="#8EA9D8";
            break;
        }

        if(document.getElementById("drawingLegendaButton"+rinforzo.colore)==null)
        {
            var legendaItem=document.createElement("button");
            legendaItem.setAttribute("class","text-action-button drawing-lamiera-legenda-button");
            legendaItem.setAttribute("id","drawingLegendaButton"+rinforzo.colore);
            legendaItem.setAttribute("disabled","disabled");
            if((document.getElementsByClassName("drawing-lamiera-legenda-button").length+document.getElementsByClassName("drawing-lana-legenda-button").length)==0)
                legendaItem.setAttribute("style","margin-left:auto;background-color:"+rinforzo.colore);
            else
                legendaItem.setAttribute("style","background-color:"+rinforzo.colore);
            legendaItem.innerHTML="<span>"+rinforzo.descrizione_materiale+"</span>";
            document.getElementsByClassName("drawing-actions-container")[0].appendChild(legendaItem);
        }

        var lunghezza=getScaledMeasure(rinforzo.lunghezza);
        var hrin=getScaledMeasure(rinforzo.hrin);
        var posy=getScaledMeasure(rinforzo.posy);
        var posx=getScaledMeasure(rinforzo.posx);

        if(rinforzo.vh=="VER")
        {
            var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
            //rect.setAttribute("class","svg-rect-rinforzo");
            rect.setAttribute("style","fill:"+rinforzo.colore+";stroke:white;stroke-width:1;");
            rect.setAttribute("x",x_pannello+altezza_pannello-lunghezza-posy);
            rect.setAttribute("y",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx-(hrin/2));
            rect.setAttribute("width",lunghezza);
            rect.setAttribute("height",hrin);
            svg.appendChild(rect);
            
            //quota rinforzo
            if(!quote_rappresentate.includes(rinforzo.posx))
            {
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i));
                line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx);
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i));
                line.setAttribute("y2",y_pannello+larghezza_lato_orrizzontale+larghezza_lato_verticale);
                svg.appendChild(line);
            
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i)-(lunghezza_trattino_quote/2));
                line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx);
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+(lunghezza_trattino_quote/2));
                line.setAttribute("y2",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx);
                svg.appendChild(line);
            
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i)-(lunghezza_trattino_quote/2));
                line.setAttribute("y1",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+(lunghezza_trattino_quote/2));
                line.setAttribute("y2",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
                svg.appendChild(line);

                var text=document.createElementNS('http://www.w3.org/2000/svg','text');
                text.setAttribute("style","fill:white;");
                text.setAttribute("id","drawingQuotaRinforzo"+i);
                text.innerHTML=roundQuoteValue(rinforzo.posx);
                svg.appendChild(text);
                document.getElementById("drawingQuotaRinforzo"+i).setAttribute("x",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+distanza_testo_linea_quota);
                document.getElementById("drawingQuotaRinforzo"+i).setAttribute("y",y_pannello+larghezza_lato_orrizzontale+larghezza_lato_verticale-(posx/2)+((document.getElementById("drawingQuotaRinforzo"+i).getBBox().height-svgDefaultTextPadding)/2));
            
                quote_rappresentate.push(rinforzo.posx);
            }
        }
        else
        {
            var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
            //rect.setAttribute("class","svg-rect-rinforzo");
            rect.setAttribute("style","fill:"+rinforzo.colore+";stroke:white;stroke-width:1;");
            rect.setAttribute("x",x_pannello+altezza_pannello-lunghezza-posy+hrin);
            rect.setAttribute("y",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx-lunghezza);
            rect.setAttribute("width",hrin);
            rect.setAttribute("height",lunghezza);
            svg.appendChild(rect);

            //quota rinforzo
            if(!quote_rappresentate.includes(rinforzo.posx))
            {
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i));
                line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-(lunghezza/2));
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i));
                line.setAttribute("y2",y_pannello+larghezza_lato_orrizzontale+larghezza_lato_verticale);
                svg.appendChild(line);
            
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i)-(lunghezza_trattino_quote/2));
                line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-(lunghezza/2));
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+(lunghezza_trattino_quote/2));
                line.setAttribute("y2",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-(lunghezza/2));
                svg.appendChild(line);
            
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i)-(lunghezza_trattino_quote/2));
                line.setAttribute("y1",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+(lunghezza_trattino_quote/2));
                line.setAttribute("y2",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
                svg.appendChild(line);

                var text=document.createElementNS('http://www.w3.org/2000/svg','text');
                text.setAttribute("style","fill:white;");
                text.setAttribute("id","drawingQuotaRinforzo"+i);
                text.innerHTML=roundQuoteValue((rinforzo.lunghezza/2));
                svg.appendChild(text);
                document.getElementById("drawingQuotaRinforzo"+i).setAttribute("x",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+distanza_testo_linea_quota);
                document.getElementById("drawingQuotaRinforzo"+i).setAttribute("y",y_pannello+larghezza_lato_orrizzontale+larghezza_lato_verticale-(lunghezza/4)+((document.getElementById("drawingQuotaRinforzo"+i).getBBox().height-svgDefaultTextPadding)/2));
            
                quote_rappresentate.push(rinforzo.posx);
            }
        }
        i++;
    });
}
async function getDrawingLana()
{
    var container=document.getElementById("drawingInnerContainer");
    container.innerHTML="";

    $(".drawing-lamiera-legenda-button").remove();
    $(".drawing-lana-legenda-button").remove();
    $("#messaggioRecuperoLanaButton").remove();

    var containerWidth=container.offsetWidth;
    var containerHeight=container.offsetHeight;

    var lung1=getScaledMeasure(pannello.lung1);
    var lung2=getScaledMeasure(pannello.lung2);
    var halt=getScaledMeasure(pannello.halt);

    var altezza_pannello=halt;
    var larghezza_lato_orrizzontale=lung1;
    var larghezza_lato_verticale=lung2;
    
    var svg=document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id","drawingSvg");
    container.appendChild(svg);

    var svg_height=830;
    var svg_width=1180;
    
    var x_pannello=(svg_width/2)-(altezza_pannello/2);
    var y_pannello=(svg_height/2)-((larghezza_lato_verticale+larghezza_lato_orrizzontale)/2);

    //pannello
    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute("style","fill:gray;stroke:black;stroke-width:1;");
    rect.setAttribute("x",x_pannello);
    rect.setAttribute("y",y_pannello);
    rect.setAttribute("width",altezza_pannello);
    rect.setAttribute("height",larghezza_lato_verticale);
    svg.appendChild(rect);

    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute("style","fill:gray;stroke:black;stroke-width:1;");
    rect.setAttribute("x",x_pannello);
    rect.setAttribute("y",y_pannello+larghezza_lato_verticale);
    rect.setAttribute("width",altezza_pannello);
    rect.setAttribute("height",larghezza_lato_orrizzontale);
    svg.appendChild(rect);

    //quota altezza pannello
    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello);
    line.setAttribute("y1",y_pannello-distanza_quota_pannello);
    line.setAttribute("x2",x_pannello+altezza_pannello);
    line.setAttribute("y2",y_pannello-distanza_quota_pannello);
    svg.appendChild(line);

    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello);
    line.setAttribute("y1",y_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
    line.setAttribute("x2",x_pannello);
    line.setAttribute("y2",y_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
    svg.appendChild(line);

    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello+altezza_pannello);
    line.setAttribute("y1",y_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
    line.setAttribute("x2",x_pannello+altezza_pannello);
    line.setAttribute("y2",y_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
    svg.appendChild(line);

    var text=document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute("style","fill:white");
    text.setAttribute("x",(x_pannello+altezza_pannello)/2);
    text.setAttribute("y",y_pannello-distanza_quota_pannello-distanza_testo_linea_quota);
    text.innerHTML=roundQuoteValue(pannello.halt);
    svg.appendChild(text);

    //quote larghezza pannello
    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello-distanza_quota_pannello);
    line.setAttribute("y1",y_pannello);
    line.setAttribute("x2",x_pannello-distanza_quota_pannello);
    line.setAttribute("y2",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
    svg.appendChild(line);

    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
    line.setAttribute("y1",y_pannello);
    line.setAttribute("x2",x_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
    line.setAttribute("y2",y_pannello);
    svg.appendChild(line);

    var line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute("style","stroke:white;stroke-width:1;");
    line.setAttribute("x1",x_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
    line.setAttribute("y1",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
    line.setAttribute("x2",x_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
    line.setAttribute("y2",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
    svg.appendChild(line);

    if(larghezza_lato_verticale>0)
    {
        var line=document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute("style","stroke:white;stroke-width:1;");
        line.setAttribute("x1",x_pannello-distanza_quota_pannello-(lunghezza_trattino_quote/2));
        line.setAttribute("y1",y_pannello+larghezza_lato_verticale);
        line.setAttribute("x2",x_pannello-distanza_quota_pannello+(lunghezza_trattino_quote/2));
        line.setAttribute("y2",y_pannello+larghezza_lato_verticale);
        svg.appendChild(line);

        var text=document.createElementNS('http://www.w3.org/2000/svg','text');
        text.setAttribute("style","fill:white;");
        text.setAttribute("id","drawingQuotaLung2");
        text.innerHTML=roundQuoteValue(pannello.lung2);
        svg.appendChild(text);
        document.getElementById("drawingQuotaLung2").setAttribute("x",x_pannello-distanza_quota_pannello-distanza_testo_linea_quota-(document.getElementById("drawingQuotaLung2").getBBox().width));
        document.getElementById("drawingQuotaLung2").setAttribute("y",y_pannello+(larghezza_lato_verticale)/2+((document.getElementById("drawingQuotaLung2").getBBox().height-svgDefaultTextPadding)/2));
    }

    var text=document.createElementNS('http://www.w3.org/2000/svg','text');
    text.setAttribute("style","fill:white;");
    text.setAttribute("id","drawingQuotaLung1");
    text.innerHTML=roundQuoteValue(pannello.lung1);
    svg.appendChild(text);
    document.getElementById("drawingQuotaLung1").setAttribute("x",x_pannello-distanza_quota_pannello-distanza_testo_linea_quota-(document.getElementById("drawingQuotaLung1").getBBox().width));
    document.getElementById("drawingQuotaLung1").setAttribute("y",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale)/2+((document.getElementById("drawingQuotaLung1").getBBox().height-svgDefaultTextPadding)/2));

    //rinforzi
    var i=1;
    var quote_rappresentate=[];
    pannello.rinforzi.forEach(rinforzo =>
    {
        //console.log(rinforzo);
        switch (rinforzo.codice_materia_prima)
        {
            case "R1":
                rinforzo.colore="#85D3D5";
            break;
            case "R69":
                rinforzo.colore="#C7CEEA";
            break;
            case "R74":
                rinforzo.colore="#F4F4E0";
            break;
            case "R7":
                rinforzo.colore="#ADB3DB";
            break;
            case "R65":
                rinforzo.colore="#8EA9D8";
            break;
        }

        if(document.getElementById("drawingLegendaButton"+rinforzo.colore)==null)
        {
            var legendaItem=document.createElement("button");
            legendaItem.setAttribute("class","text-action-button drawing-lamiera-legenda-button");
            legendaItem.setAttribute("id","drawingLegendaButton"+rinforzo.colore);
            legendaItem.setAttribute("disabled","disabled");
            if((document.getElementsByClassName("drawing-lamiera-legenda-button").length+document.getElementsByClassName("drawing-lana-legenda-button").length)==0)
                legendaItem.setAttribute("style","margin-left:auto;background-color:"+rinforzo.colore);
            else
                legendaItem.setAttribute("style","background-color:"+rinforzo.colore);
            legendaItem.innerHTML="<span>"+rinforzo.descrizione_materiale+"</span>";
            document.getElementsByClassName("drawing-actions-container")[0].appendChild(legendaItem);
        }

        var lunghezza=getScaledMeasure(rinforzo.lunghezza);
        var hrin=getScaledMeasure(rinforzo.hrin);
        var posy=getScaledMeasure(rinforzo.posy);
        var posx=getScaledMeasure(rinforzo.posx);

        if(rinforzo.vh=="VER")
        {
            var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
            //rect.setAttribute("class","svg-rect-rinforzo");
            rect.setAttribute("style","fill:"+rinforzo.colore+";stroke:white;stroke-width:1;");
            rect.setAttribute("x",x_pannello+altezza_pannello-lunghezza-posy);
            rect.setAttribute("y",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx-(hrin/2));
            rect.setAttribute("width",lunghezza);
            rect.setAttribute("height",hrin);
            svg.appendChild(rect);
            
            //quota rinforzo
            if(!quote_rappresentate.includes(rinforzo.posx))
            {
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i));
                line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx);
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i));
                line.setAttribute("y2",y_pannello+larghezza_lato_orrizzontale+larghezza_lato_verticale);
                svg.appendChild(line);
            
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i)-(lunghezza_trattino_quote/2));
                line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx);
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+(lunghezza_trattino_quote/2));
                line.setAttribute("y2",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx);
                svg.appendChild(line);
            
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i)-(lunghezza_trattino_quote/2));
                line.setAttribute("y1",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+(lunghezza_trattino_quote/2));
                line.setAttribute("y2",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
                svg.appendChild(line);

                var text=document.createElementNS('http://www.w3.org/2000/svg','text');
                text.setAttribute("style","fill:white;");
                text.setAttribute("id","drawingQuotaRinforzo"+i);
                text.innerHTML=roundQuoteValue(rinforzo.posx);
                svg.appendChild(text);
                document.getElementById("drawingQuotaRinforzo"+i).setAttribute("x",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+distanza_testo_linea_quota);
                document.getElementById("drawingQuotaRinforzo"+i).setAttribute("y",y_pannello+larghezza_lato_orrizzontale+larghezza_lato_verticale-(posx/2)+((document.getElementById("drawingQuotaRinforzo"+i).getBBox().height-svgDefaultTextPadding)/2));
            
                quote_rappresentate.push(rinforzo.posx);
            }
        }
        else
        {
            var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
            //rect.setAttribute("class","svg-rect-rinforzo");
            rect.setAttribute("style","fill:"+rinforzo.colore+";stroke:white;stroke-width:1;");
            rect.setAttribute("x",x_pannello+altezza_pannello-lunghezza-posy+hrin);
            rect.setAttribute("y",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx-lunghezza);
            rect.setAttribute("width",hrin);
            rect.setAttribute("height",lunghezza);
            svg.appendChild(rect);

            //quota rinforzo
            if(!quote_rappresentate.includes(rinforzo.posx))
            {
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i));
                line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-(lunghezza/2));
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i));
                line.setAttribute("y2",y_pannello+larghezza_lato_orrizzontale+larghezza_lato_verticale);
                svg.appendChild(line);
            
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i)-(lunghezza_trattino_quote/2));
                line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-(lunghezza/2));
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+(lunghezza_trattino_quote/2));
                line.setAttribute("y2",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-(lunghezza/2));
                svg.appendChild(line);
            
                var line=document.createElementNS('http://www.w3.org/2000/svg','line');
                line.setAttribute("style","stroke:white;stroke-width:1;");
                line.setAttribute("x1",x_pannello+altezza_pannello+(distanza_quota_pannello*i)-(lunghezza_trattino_quote/2));
                line.setAttribute("y1",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
                line.setAttribute("x2",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+(lunghezza_trattino_quote/2));
                line.setAttribute("y2",y_pannello+(larghezza_lato_orrizzontale+larghezza_lato_verticale));
                svg.appendChild(line);

                var text=document.createElementNS('http://www.w3.org/2000/svg','text');
                text.setAttribute("style","fill:white;");
                text.setAttribute("id","drawingQuotaRinforzo"+i);
                text.innerHTML=roundQuoteValue((rinforzo.lunghezza/2));
                svg.appendChild(text);
                document.getElementById("drawingQuotaRinforzo"+i).setAttribute("x",x_pannello+altezza_pannello+(distanza_quota_pannello*i)+distanza_testo_linea_quota);
                document.getElementById("drawingQuotaRinforzo"+i).setAttribute("y",y_pannello+larghezza_lato_orrizzontale+larghezza_lato_verticale-(lunghezza/4)+((document.getElementById("drawingQuotaRinforzo"+i).getBBox().height-svgDefaultTextPadding)/2));
            
                quote_rappresentate.push(rinforzo.posx);
            }
        }
        i++;
    });

    //lane
    var lanaUsata=0;
    var posxArray=[];
    pannello.lane.forEach(lana =>
    {
        //console.log(lana);
        switch (lana.spess)
        {
            case 15:
                lana.colore="rgba(255,255,153,0.4);";
            break;
            case 24:
                lana.colore="rgba(255,255,153,0.4);";
            break;
            case 25:
                lana.colore="rgba(255,255,153,0.4);";
            break;
        }

        if(document.getElementById("drawingLegendaButton"+lana.colore)==null)
        {
            var legendaItem=document.createElement("button");
            legendaItem.setAttribute("class","text-action-button drawing-lana-legenda-button");
            legendaItem.setAttribute("id","drawingLegendaButton"+lana.colore);
            legendaItem.setAttribute("disabled","disabled");
            if((document.getElementsByClassName("drawing-lamiera-legenda-button").length+document.getElementsByClassName("drawing-lana-legenda-button").length)==0)
                legendaItem.setAttribute("style","margin-left:auto;background-color:"+lana.colore);
            else
                legendaItem.setAttribute("style","background-color:"+lana.colore);
            legendaItem.innerHTML="<span>"+lana.descrizione_materiale+"</span>";
            document.getElementsByClassName("drawing-actions-container")[0].appendChild(legendaItem);
        }

        var lung=getScaledMeasure(lana.lung);
        var halt=getScaledMeasure(lana.halt);
        var posy=getScaledMeasure(lana.posy);
        var posx=getScaledMeasure(lana.posx);

        var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
        rect.setAttribute("style","fill:"+lana.colore+";stroke:#DA6969;stroke-width:1;");
        rect.setAttribute("x",x_pannello+altezza_pannello-halt);
        rect.setAttribute("y",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx-lung);
        rect.setAttribute("width",halt);
        rect.setAttribute("height",lung);
        svg.appendChild(rect);

        lanaUsata+=lana.lung;
        posxArray.push(lana.posx);
    });

    //controllo scarto lana
    var messaggioRecuperoLana=document.createElement("button");
    messaggioRecuperoLana.setAttribute("class","text-action-button");
    messaggioRecuperoLana.setAttribute("id","messaggioRecuperoLanaButton");
    messaggioRecuperoLana.setAttribute("disabled","disabled");
    if(600-lanaUsata>limite_recupero_lana)
    {
        messaggioRecuperoLana.setAttribute("style","background-color:transparent;color:#DA6969;box-shadow:none");
        messaggioRecuperoLana.innerHTML="<span>Recupera lana restante</span>";
    }
    else
    {
        messaggioRecuperoLana.setAttribute("style","background-color:transparent;color:white;box-shadow:none");
        messaggioRecuperoLana.innerHTML="<span>Scarta lana restante</span>";
    }
    document.getElementById("toggleDrawingButton").parentNode.insertBefore(messaggioRecuperoLana, document.getElementById("toggleDrawingButton").nextSibling);
    if(pannello.tipo=="STD")
    {
        var maxPosx=Math.max.apply(null, posxArray);
        var lana_fresatura;
        pannello.lane.forEach(lana =>
        {
            if(lana.posx==maxPosx)
                lana_fresatura=lana;
        });

        var lung=getScaledMeasure(lana_fresatura.lung);
        var halt=getScaledMeasure(lana_fresatura.halt);
        var posy=getScaledMeasure(lana_fresatura.posy);
        var posx=getScaledMeasure(lana_fresatura.posx);

        console.log(lana_fresatura)

        var line=document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute("style","stroke:#70B085;stroke-width:"+getScaledMeasure(stroke_width_lana_fresatura));
        line.setAttribute("x1",x_pannello+altezza_pannello-halt+1);
        line.setAttribute("y1",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx-lung+(getScaledMeasure(stroke_width_lana_fresatura)/2)+1);
        line.setAttribute("x2",x_pannello+halt-1);
        line.setAttribute("y2",y_pannello+larghezza_lato_verticale+larghezza_lato_orrizzontale-posx-lung+(getScaledMeasure(stroke_width_lana_fresatura)/2)+1);
        svg.appendChild(line);
    }
}

function getScaledMeasure(measure)
{
    var scaleFactor1=parseFloat(scale.split(":")[0]);
    var scaleFactor2=parseFloat(scale.split(":")[1]);

    return (measure*scaleFactor1)/scaleFactor2;
}
function roundQuoteValue(value)
{
    if(value.toString().split(".").length>1)
        return value.toFixed(1);
    else
        return value;
}
//------------------------------------------------------3D------------------------------------------------------------

/*
var drawing3DObj;
var isDrawing3DObjSpinning;
function animateDrawing3D()
{
    if(drawing3DObj!=null)
    {
        //drawing3DObj.rotate.x += isDrawing3DObjSpinning ? 0.003 : 0;
        drawing3DObj.updateRenderGraph();
        requestAnimationFrame( animateDrawing3D );
    }
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
    ////console.log(rinforzo);

    rinforzo.largezza=80;//prenderlo da query???

    var lunghezza=getScaledMeasure(rinforzo.lunghezza);
    var posx=getScaledMeasure(rinforzo.posx);//asse del rinforzo
    var posy=getScaledMeasure(rinforzo.posy);//inizio del rinforzo
    var larghezza_rinforzo=getScaledMeasure(rinforzo.largezza);
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

animateDrawing3D();*/