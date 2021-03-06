<?php

    include "connessione.php";

    $ordini_di_produzione=[];

    $query2="SELECT DISTINCT 
                TOP (100) PERCENT dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione, dw_produzione.dbo.ordini_di_produzione.nome AS ordine_di_produzione, dw_produzione.dbo.lotti.id_lotto, dw_produzione.dbo.lotti.lotto, 
                totale_pannelli_ordini_di_produzione.totale_pannelli, ISNULL(pannelli_caricati.pannelli_caricati, 0) AS pannelli_caricati, CASE WHEN pannelli_caricati = totale_pannelli THEN 'true' ELSE 'false' END AS terminato
            FROM dw_produzione.dbo.ordini_di_produzione INNER JOIN
                dw_produzione.dbo.lotti ON dw_produzione.dbo.ordini_di_produzione.lotto = dw_produzione.dbo.lotti.id_lotto INNER JOIN
                dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN
                dw_produzione.dbo.stazioni ON dw_produzione.dbo.distinta_ordini_di_produzione.stazione = dw_produzione.dbo.stazioni.id_stazione INNER JOIN
                    (SELECT COUNT(db_tecnico.dbo.pannelli.id_pannello) AS totale_pannelli, ordini_di_produzione_1.id_ordine_di_produzione
                    FROM db_tecnico.dbo.pannelli INNER JOIN
                                                dw_produzione.dbo.distinta_ordini_di_produzione AS distinta_ordini_di_produzione_1 ON db_tecnico.dbo.pannelli.id_pannello = distinta_ordini_di_produzione_1.pannello INNER JOIN
                                                dw_produzione.dbo.ordini_di_produzione AS ordini_di_produzione_1 ON distinta_ordini_di_produzione_1.ordine_di_produzione = ordini_di_produzione_1.id_ordine_di_produzione
                    GROUP BY ordini_di_produzione_1.id_ordine_di_produzione) AS totale_pannelli_ordini_di_produzione ON 
                dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = totale_pannelli_ordini_di_produzione.id_ordine_di_produzione LEFT OUTER JOIN
                    (SELECT COUNT(pannelli_1.id_pannello) AS pannelli_caricati, ordini_di_produzione_2.id_ordine_di_produzione
                    FROM db_tecnico.dbo.pannelli AS pannelli_1 INNER JOIN
                                                dw_produzione.dbo.distinta_ordini_di_produzione AS distinta_ordini_di_produzione_2 ON pannelli_1.id_pannello = distinta_ordini_di_produzione_2.pannello INNER JOIN
                                                dbo.pannelli_caricati AS pannelli_caricati_1 ON distinta_ordini_di_produzione_2.id_distinta = pannelli_caricati_1.id_distinta INNER JOIN
                                                dw_produzione.dbo.ordini_di_produzione AS ordini_di_produzione_2 ON distinta_ordini_di_produzione_2.ordine_di_produzione = ordini_di_produzione_2.id_ordine_di_produzione
                    GROUP BY ordini_di_produzione_2.id_ordine_di_produzione) AS pannelli_caricati ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = pannelli_caricati.id_ordine_di_produzione
            WHERE (dw_produzione.dbo.stazioni.nome = 'incollaggio') AND (dw_produzione.dbo.ordini_di_produzione.eliminato = 'false')
            ORDER BY terminato, dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione DESC";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $ordine_di_produzione["id_ordine_di_produzione"]=$row2['id_ordine_di_produzione'];
            $ordine_di_produzione["ordine_di_produzione"]=$row2['ordine_di_produzione'];
            $ordine_di_produzione["id_lotto"]=$row2['id_lotto'];
            $ordine_di_produzione["lotto"]=$row2['lotto'];
            $ordine_di_produzione["totale_pannelli"]=$row2['totale_pannelli'];
            $ordine_di_produzione["pannelli_caricati"]=$row2['pannelli_caricati'];
            $ordine_di_produzione["terminato"]=$row2['terminato'];

            array_push($ordini_di_produzione,$ordine_di_produzione);
        }
    }
    else
        die("error");

    echo json_encode($ordini_di_produzione);

?>