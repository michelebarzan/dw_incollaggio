<?php

    include "connessione.php";

    $ordini_di_produzione=[];

    $query2="SELECT DISTINCT TOP (100) PERCENT dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione, dw_produzione.dbo.ordini_di_produzione.nome AS ordine_di_produzione, dw_produzione.dbo.lotti.id_lotto, dw_produzione.dbo.lotti.lotto
            FROM dw_produzione.dbo.ordini_di_produzione INNER JOIN dw_produzione.dbo.lotti ON dw_produzione.dbo.ordini_di_produzione.lotto = dw_produzione.dbo.lotti.id_lotto INNER JOIN dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN dw_produzione.dbo.stazioni ON dw_produzione.dbo.distinta_ordini_di_produzione.stazione = dw_produzione.dbo.stazioni.id_stazione
            WHERE (dw_produzione.dbo.stazioni.nome = 'incollaggio') AND dw_produzione.dbo.ordini_di_produzione.eliminato='false'
            ORDER BY ordine_di_produzione";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $ordine_di_produzione["id_ordine_di_produzione"]=$row2['id_ordine_di_produzione'];
            $ordine_di_produzione["ordine_di_produzione"]=$row2['ordine_di_produzione'];
            $ordine_di_produzione["id_lotto"]=$row2['id_lotto'];
            $ordine_di_produzione["lotto"]=$row2['lotto'];

            array_push($ordini_di_produzione,$ordine_di_produzione);
        }
    }
    else
        die("error");

    echo json_encode($ordini_di_produzione);

?>