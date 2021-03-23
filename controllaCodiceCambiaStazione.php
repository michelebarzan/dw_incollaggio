<?php

    include "connessione.php";
	
    $codice= $_POST['codice'];

    $q2="SELECT * FROM parametri WHERE nome='codice_cambia_stazione'";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }
    else
    {
        while($row2=sqlsrv_fetch_array($r2))
        {
            if($row2['valore']==$codice)
                echo "OK";
            else
                echo "KO";
        }
    }

?>