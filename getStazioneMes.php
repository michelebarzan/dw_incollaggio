<?php

    $database = "dw_produzione";
    include "connessioneDb.php";

    $query2="SELECT * FROM stazioni WHERE nome = 'assemblaggio_byrb'";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $stazione["id_stazione"]=$row2['id_stazione'];
            $stazione["nome"]=$row2['nome'];
            $stazione["descrizione"]=utf8_encode($row2['descrizione']);
            $stazione["richiede_conferma_produzione"]=filter_var($row2['richiede_conferma_produzione'], FILTER_VALIDATE_BOOLEAN);
            $stazione["display_raggruppa_pannelli"]=filter_var($row2['display_raggruppa_pannelli'], FILTER_VALIDATE_BOOLEAN);
            $stazione["allow_scan_codice_pannello"]=filter_var($row2['allow_scan_codice_pannello'], FILTER_VALIDATE_BOOLEAN);
            $stazione["conferma_pezzo_alla_selezione"]=filter_var($row2['conferma_pezzo_alla_selezione'], FILTER_VALIDATE_BOOLEAN);
            $stazione["stampa_etichetta_alla_selezione"]=filter_var($row2['stampa_etichetta_alla_selezione'], FILTER_VALIDATE_BOOLEAN);
            $stazione["stampa_etichetta_alla_conferma"]=filter_var($row2['stampa_etichetta_alla_conferma'], FILTER_VALIDATE_BOOLEAN);
            $stazione["avviso_controllo_qualita"]=filter_var($row2['avviso_controllo_qualita'], FILTER_VALIDATE_BOOLEAN);
            $stazione["messaggio_controllo_qualita"]=utf8_encode($row2['messaggio_controllo_qualita']);

            echo json_encode($stazione);
        }
    }
    else
        die("error");


?>