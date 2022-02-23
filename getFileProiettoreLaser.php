<?php

	include "connessione.php";

    $pannello=json_decode($_REQUEST["JSONpannello"],true);

    $array_testo_programma=[];
    
    $query="SELECT valore FROM parametri WHERE nome='disegna_pannello_file_proiettore'";
    $result=sqlsrv_query($conn,$query);
    if($result==FALSE)
        die("error1");
    else
    {
        while($row=sqlsrv_fetch_array($result))
        {
            $disegna_pannello_file_proiettore=$row['valore'];
        }
    }
    $query1="SELECT valore FROM parametri WHERE nome='inizio_file_proiettore'";
    $result1=sqlsrv_query($conn,$query1);
    if($result1==FALSE)
        die("error1");
    else
    {
        while($row1=sqlsrv_fetch_array($result1))
        {
            $inizio_file_proiettore=explode(";",substr($row1['valore'], 0, -1));
        }
    }
    $query2="SELECT valore FROM parametri WHERE nome='linea_continua_file_proiettore'";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==FALSE)
        die("error2");
    else
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $linea_continua_file_proiettore=explode(";",substr($row2['valore'], 0, -1));
        }
    }
    $query3="SELECT valore FROM parametri WHERE nome='fine_file_proiettore'";
    $result3=sqlsrv_query($conn,$query3);
    if($result3==FALSE)
        die("error3");
    else
    {
        while($row3=sqlsrv_fetch_array($result3))
        {
            $fine_file_proiettore=explode(";",substr($row3['valore'], 0, -1));
        }
    }
    $query14="SELECT valore FROM parametri WHERE nome='percorso_file_proiettore'";
    $result14=sqlsrv_query($conn,$query14);
    if($result14==FALSE)
        die("error5");
    else
    {
        while($row14=sqlsrv_fetch_array($result14))
        {
            $percorso_file_proiettore=$row14['valore'];
        }
    }
    $query8="SELECT valore FROM parametri WHERE nome='numero_tratti_file_proiettore'";
    $result8=sqlsrv_query($conn,$query8);
    if($result8==FALSE)
        die("error5");
    else
    {
        while($row8=sqlsrv_fetch_array($result8))
        {
            $numero_tratti_file_proiettore=floatval($row8['valore']);
        }
    }
    $query9="SELECT valore FROM parametri WHERE nome='spazio_tratti_file_proiettore'";
    $result9=sqlsrv_query($conn,$query9);
    if($result9==FALSE)
        die("error5");
    else
    {
        while($row9=sqlsrv_fetch_array($result9))
        {
            $spazio_tratti_file_proiettore=floatval($row9['valore']);
        }
    }

    foreach ($inizio_file_proiettore as $riga)
    {
        $istruzione=$riga.";";
        array_push($array_testo_programma,$istruzione);
    }

    if($pannello["faccia"] == "fronte")
    {
        switch ($pannello["NumeroDima"])
        {
            case 0:
                disegnaPannello($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,$array_testo_programma);
                disegnaRinforzi($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,$array_testo_programma);
            break;
            case 1:
                disegnaLineeOrrizzontaliRinforzi($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,$array_testo_programma);
            break;
            case 2:
                disegnaLineeOrrizzontaliRinforzi($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,$array_testo_programma);
            break;
            case 7:
                disegnaPannello($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,$array_testo_programma);
                disegnaRinforzi($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,$array_testo_programma);
            break;
            default:
                disegnaX($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,$array_testo_programma);
            break;
        }
    }

    foreach ($fine_file_proiettore as $riga)
    {
        $istruzione=$riga.";";
        array_push($array_testo_programma,$istruzione);
    }

    $file_proiettore = fopen($percorso_file_proiettore."/program.plt", "w") or die("error");

    $i=1;
    foreach ($array_testo_programma as $istruzione)
    {
        if($i==sizeof($array_testo_programma))
            fwrite($file_proiettore, $istruzione);
        else
            fwrite($file_proiettore, $istruzione."\n");
        $i++;
    }
    
    fclose($file_proiettore);
    
    echo json_encode($array_testo_programma);

    //--------------------------------------------------------------------------------------------------------------------

    function disegnaPannello($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,&$array_testo_programma)
    {
        if($disegna_pannello_file_proiettore=="true")
        {
            if($pannello["ruotato"])
            {
                $lato1 = $pannello['lung2'];
                $lato2 = $pannello['lung1'];
            }
            else
            {
                $lato1 = $pannello['lung1'];
                $lato2 = $pannello['lung2'];
            }

            foreach ($linea_continua_file_proiettore as $riga)
            {
                $istruzione=$riga.";";
                array_push($array_testo_programma,$istruzione);
            }
    
            if($pannello['lung2']>0)
            {
                $istruzione="PU0 0;";
                array_push($array_testo_programma,$istruzione);
            
                $istruzione="PD".$pannello['halt']." 0;";
                array_push($array_testo_programma,$istruzione);
            
                $istruzione="PD".$pannello['halt']." ".$lato1.";";
                array_push($array_testo_programma,$istruzione);
            
                $istruzione="PD0 ".$lato1.";";
                array_push($array_testo_programma,$istruzione);
            
                $istruzione="PD0 0;";
                array_push($array_testo_programma,$istruzione);
            }
        
            if($pannello['lung1']>0)
            {
                $istruzione="PU0 ".$lato1.";";
                array_push($array_testo_programma,$istruzione);
            
                $istruzione="PD0 ".($lato1+$lato2).";";
                array_push($array_testo_programma,$istruzione);
            
                $istruzione="PD".$pannello['halt']." ".($lato1+$lato2).";";
                array_push($array_testo_programma,$istruzione);
            
                $istruzione="PD".$pannello['halt']." ".$lato1.";";
                array_push($array_testo_programma,$istruzione);
            }
        }
        else
        {
            if(sizeof($pannello['rinforzi'])>0)
            {
                foreach ($linea_continua_file_proiettore as $riga)
                {
                    $istruzione=$riga.";";
                    array_push($array_testo_programma,$istruzione);
                }
            }  
        }
    }

    function disegnaRinforzi($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,&$array_testo_programma)
    {
        if($pannello["ruotato"])
        {
            foreach ($pannello['rinforzi'] as $rinforzo)
            {
                if($rinforzo['vh']=="HOR")
                {
                    $istruzione="PU".($pannello["halt"]-$rinforzo['posy']-($rinforzo['hrin']/2))." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($pannello["halt"]-$rinforzo['posy']-($rinforzo['hrin']/2))." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']-$rinforzo['lunghezza']).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($pannello["halt"]-$rinforzo['posy']+($rinforzo['hrin']/2))." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']-$rinforzo['lunghezza']).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($pannello["halt"]-$rinforzo['posy']+($rinforzo['hrin']/2))." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($pannello["halt"]-$rinforzo['posy']-($rinforzo['hrin']/2))." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']).";";
                    array_push($array_testo_programma,$istruzione);
                }
                else
                {
                    $istruzione="PU".($pannello["halt"]-$rinforzo['posy'])." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']+($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($pannello["halt"]-$rinforzo['posy']-$rinforzo['lunghezza'])." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']+($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($pannello["halt"]-$rinforzo['posy']-$rinforzo['lunghezza'])." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']-($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($pannello["halt"]-$rinforzo['posy'])." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']-($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
    
                    $istruzione="PD".$pannello["halt"]-$rinforzo['posy']." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']-($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
    
                    $istruzione="PD".($pannello["halt"]-$rinforzo['posy']-$rinforzo['lunghezza'])." ".($pannello["lung1"]+$pannello["lung2"]-$rinforzo['posx']+($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
                }
            }
        }
        else
        {
            foreach ($pannello['rinforzi'] as $rinforzo)
            {
                if($rinforzo['vh']=="HOR")
                {
                    $istruzione="PU".($rinforzo['posy']-($rinforzo['hrin']/2))." ".($rinforzo['posx']).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($rinforzo['posy']-($rinforzo['hrin']/2))." ".($rinforzo['posx']+$rinforzo['lunghezza']).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($rinforzo['posy']+($rinforzo['hrin']/2))." ".($rinforzo['posx']+$rinforzo['lunghezza']).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($rinforzo['posy']+($rinforzo['hrin']/2))." ".($rinforzo['posx']).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($rinforzo['posy']-($rinforzo['hrin']/2))." ".($rinforzo['posx']).";";
                    array_push($array_testo_programma,$istruzione);
                }
                else
                {
                    $istruzione="PU".($rinforzo['posy'])." ".($rinforzo['posx']+($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($rinforzo['posy']+$rinforzo['lunghezza'])." ".($rinforzo['posx']+($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($rinforzo['posy']+$rinforzo['lunghezza'])." ".($rinforzo['posx']-($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
            
                    $istruzione="PD".($rinforzo['posy'])." ".($rinforzo['posx']-($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
    
                    $istruzione="PD".$rinforzo['posy']." ".($rinforzo['posx']-($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
    
                    $istruzione="PD".($rinforzo['posy']+$rinforzo['lunghezza'])." ".($rinforzo['posx']+($rinforzo['hrin']/2)).";";
                    array_push($array_testo_programma,$istruzione);
                }
            }
        }
    }

    function disegnaLineeOrrizzontaliRinforzi($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,&$array_testo_programma)
    {
        if(sizeof($pannello['rinforzi'])>0)
        {
            foreach ($linea_continua_file_proiettore as $riga)
            {
                $istruzione=$riga.";";
                array_push($array_testo_programma,$istruzione);
            }
        }
        foreach ($pannello['rinforzi'] as $rinforzo)
        {
            if($rinforzo['vh']=="HOR")
            {
                $istruzione="PU".($rinforzo['posy']-($rinforzo['hrin']/2))." 0;";
                array_push($array_testo_programma,$istruzione);
        
                $istruzione="PD".($rinforzo['posy']-($rinforzo['hrin']/2))." ".($pannello['lung1']+$pannello['lung2']).";";
                array_push($array_testo_programma,$istruzione);
        
                $istruzione="PU".($rinforzo['posy']+($rinforzo['hrin']/2))." 0;";
                array_push($array_testo_programma,$istruzione);
        
                $istruzione="PD".($rinforzo['posy']+($rinforzo['hrin']/2))." ".($pannello['lung1']+$pannello['lung2']).";";
                array_push($array_testo_programma,$istruzione);
            }
        }
    }

    function disegnaX($pannello,$disegna_pannello_file_proiettore,$inizio_file_proiettore,$linea_continua_file_proiettore,$fine_file_proiettore,$percorso_file_proiettore,$numero_tratti_file_proiettore,$spazio_tratti_file_proiettore,&$array_testo_programma)
    {
        if(sizeof($pannello['rinforzi'])>0)
        {
            foreach ($linea_continua_file_proiettore as $riga)
            {
                $istruzione=$riga.";";
                array_push($array_testo_programma,$istruzione);
            }
        }
        
        $istruzione="PU0 0;";
        array_push($array_testo_programma,$istruzione);
    
        $istruzione="PD".$pannello['halt']." ".($pannello['lung1']+$pannello['lung2']).";";
        array_push($array_testo_programma,$istruzione);
    
        $istruzione="PU0 ".($pannello['lung1']+$pannello['lung2']).";";
        array_push($array_testo_programma,$istruzione);
    
        $istruzione="PD".$pannello['halt']." 0;";
        array_push($array_testo_programma,$istruzione);
    }

?>