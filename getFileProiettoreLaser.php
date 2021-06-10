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

    if($disegna_pannello_file_proiettore=="true")
    {
        foreach ($linea_continua_file_proiettore as $riga)
        {
            $istruzione=$riga.";";
            array_push($array_testo_programma,$istruzione);
        }

        if($pannello['lung2']>0)
        {
            $istruzione="PU0 0;";
            array_push($array_testo_programma,$istruzione);
        
            $istruzione="PD0 ".$pannello['halt'].";";
            array_push($array_testo_programma,$istruzione);
        
            $istruzione="PD".$pannello['lung2']." ".$pannello['halt'].";";
            array_push($array_testo_programma,$istruzione);
        
            $istruzione="PD".$pannello['lung2']." 0;";
            array_push($array_testo_programma,$istruzione);
        
            $istruzione="PD0 0;";
            array_push($array_testo_programma,$istruzione);
        }
    
        if($pannello['lung1']>0)
        {
            $istruzione="PU".$pannello['lung2']." 0;";
            array_push($array_testo_programma,$istruzione);
        
            $istruzione="PD".$pannello['lung2']." ".$pannello['halt'].";";
            array_push($array_testo_programma,$istruzione);
        
            $istruzione="PD".($pannello['lung1']+$pannello['lung2'])." ".$pannello['halt'].";";
            array_push($array_testo_programma,$istruzione);
        
            $istruzione="PD".($pannello['lung1']+$pannello['lung2'])." 0;";
            array_push($array_testo_programma,$istruzione);
        
            $istruzione="PD".$pannello['lung2']." 0;";
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

    foreach ($pannello['rinforzi'] as $rinforzo)
    {
        if($rinforzo['vh']=="HOR")
        {
            $istruzione="PU".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx'])." ".($rinforzo['posy']-($rinforzo['hrin']/2)).";";
            array_push($array_testo_programma,$istruzione);
    
            $istruzione="PD".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx']-$rinforzo['lunghezza'])." ".($rinforzo['posy']-($rinforzo['hrin']/2)).";";
            array_push($array_testo_programma,$istruzione);
    
            $istruzione="PD".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx']-$rinforzo['lunghezza'])." ".($rinforzo['posy']+($rinforzo['hrin']/2)).";";
            array_push($array_testo_programma,$istruzione);
    
            $istruzione="PD".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx'])." ".($rinforzo['posy']+($rinforzo['hrin']/2)).";";
            array_push($array_testo_programma,$istruzione);
    
            $istruzione="PD".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx'])." ".($rinforzo['posy']-($rinforzo['hrin']/2)).";";
            array_push($array_testo_programma,$istruzione);
        }
        else
        {
            $istruzione="PU".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx']+($rinforzo['hrin']/2))." ".($rinforzo['posy']).";";
            array_push($array_testo_programma,$istruzione);
    
            $istruzione="PD".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx']-($rinforzo['hrin']/2))." ".$rinforzo['posy'].";";
            array_push($array_testo_programma,$istruzione);
    
            $istruzione="PD".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx']-($rinforzo['hrin']/2))." ".($rinforzo['posy']+$rinforzo['lunghezza']).";";
            array_push($array_testo_programma,$istruzione);
    
            $istruzione="PD".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx']+($rinforzo['hrin']/2))." ".($rinforzo['posy']+$rinforzo['lunghezza']).";";
            array_push($array_testo_programma,$istruzione);
    
            $istruzione="PD".($pannello['lung1']+$pannello['lung2']-$rinforzo['posx']+($rinforzo['hrin']/2))." ".($rinforzo['posy']).";";
            array_push($array_testo_programma,$istruzione);
        }
    }

    /*
    $rinforzi_t=[];
    $rinforzi_p=[];

    $query5="SELECT * FROM Drinforzi_laser";
    $result5=sqlsrv_query($conn,$query5);
    if($result5==FALSE)
        die("error");
    else
    {
        while($row5=sqlsrv_fetch_array($result5))
        {
            if($row5["POSY1"]!=0)
                array_push($rinforzi_t,$row5["POSY1"]);
            if($row5["POSY2"]!=0)                    
                array_push($rinforzi_t,$row5["POSY2"]);
            if($row5["POSY3"]!=0)
                array_push($rinforzi_t,$row5["POSY3"]);
            if($row5["POSY4"]!=0)
                array_push($rinforzi_t,$row5["POSY4"]);
            if($row5["POSY5"]!=0)
                array_push($rinforzi_t,$row5["POSY5"]);

            if($row5["POSY1P"]!=0)
                array_push($rinforzi_p,$row5["POSY1P"]);
            if($row5["POSY2P"]!=0)
                array_push($rinforzi_p,$row5["POSY2P"]);
            if($row5["POSY3P"]!=0)
                array_push($rinforzi_p,$row5["POSY3P"]);
            if($row5["POSY4P"]!=0)
                array_push($rinforzi_p,$row5["POSY4P"]);
            if($row5["POSY5P"]!=0)
                array_push($rinforzi_p,$row5["POSY5P"]);

            $id_produzione=$row5["id_produzione"];
            $LUNG1=$row5["LUNG1"];
        }
    }

    foreach ($rinforzi_t as $posy)
    {
        foreach ($linea_continua_file_proiettore as $riga)
        {
            $istruzione=$riga.";";
            array_push($array_testo_programma,$istruzione);
        }

        $istruzione="PU".$posy." ".$LUNG1.";";
        array_push($array_testo_programma,$istruzione);

        $istruzione="PD".$posy." 0;";
        array_push($array_testo_programma,$istruzione);
    }

    $k=0;
    foreach ($rinforzi_p as $posy)
    {
        $numero_spazi_file_proiettore=$numero_tratti_file_proiettore-1;
        $lunghezza_totale_spazi_file_proiettore=$numero_spazi_file_proiettore*$spazio_tratti_file_proiettore;
        $lunghezza_totale_tratti_file_proiettore=$LUNG1-$lunghezza_totale_spazi_file_proiettore;
        $lunghezza_tratto_file_proiettore=$lunghezza_totale_tratti_file_proiettore/$numero_tratti_file_proiettore;

        $help=$LUNG1;
        for ($j=0; $j < $numero_tratti_file_proiettore; $j++)
        { 
            foreach ($linea_continua_file_proiettore as $riga)
            {
                $istruzione=$riga.";";
                array_push($array_testo_programma,$istruzione);
            }

            $istruzione="PU".$posy." ".round($help).";";
            array_push($array_testo_programma,$istruzione);

            $help=$help-$lunghezza_tratto_file_proiettore;

            if($j == ($numero_tratti_file_proiettore-1))
            {
                $istruzione="PD".$posy." 0;";
                array_push($array_testo_programma,$istruzione);
            }
            else
            {
                $istruzione="PD".$posy." ".round($help).";";
                array_push($array_testo_programma,$istruzione);
            }

            $help=$help-$spazio_tratti_file_proiettore;
        }
        $k++;
    }
    */

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

?>