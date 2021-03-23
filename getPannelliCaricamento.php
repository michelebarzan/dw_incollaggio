<?php

    include "connessione.php";

    $id_ordine_di_produzione=$_REQUEST["id_ordine_di_produzione"];
    $numero_cabina=$_REQUEST["numero_cabina"];

    $pannelli=[];

    $query2="SELECT DISTINCT TOP (100) PERCENT dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta, db_tecnico.dbo.pannelli.id_pannello, db_tecnico.dbo.pannelli.codice_pannello
            FROM dw_produzione.dbo.ordini_di_produzione INNER JOIN dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN db_tecnico.dbo.pannelli ON dw_produzione.dbo.distinta_ordini_di_produzione.pannello = db_tecnico.dbo.pannelli.id_pannello
            WHERE (dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = $id_ordine_di_produzione) AND (dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina = '$numero_cabina') AND id_distinta NOT IN (SELECT id_distinta FROM pannelli_linea)
            ORDER BY db_tecnico.dbo.pannelli.codice_pannello";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $pannello["id_distinta"]=$row2['id_distinta'];
            $pannello["id_pannello"]=$row2['id_pannello'];
            $pannello["codice_pannello"]=$row2['codice_pannello'];

            array_push($pannelli,$pannello);
        }
    }
    else
        die("error");

    echo json_encode($pannelli);

?>