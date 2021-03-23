<?php

    include "connessione.php";

    $id_ordine_di_produzione=$_REQUEST["id_ordine_di_produzione"];

    $cabine=[];

    $query2="SELECT DISTINCT TOP (100) PERCENT dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina
            FROM dw_produzione.dbo.ordini_di_produzione INNER JOIN dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione
            WHERE (dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = $id_ordine_di_produzione)
            ORDER BY dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            array_push($cabine,$row2["numero_cabina"]);
        }
    }
    else
        die("error");

    echo json_encode($cabine);

?>