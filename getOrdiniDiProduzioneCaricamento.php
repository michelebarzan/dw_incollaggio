<?php

    include "connessione.php";

    set_time_limit(240);

    $ordini_di_produzione=[];

    $query2="SELECT DISTINCT 
    TOP (100) PERCENT dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione, dw_produzione.dbo.ordini_di_produzione.nome AS ordine_di_produzione, dw_produzione.dbo.lotti.id_lotto, dw_produzione.dbo.lotti.lotto, 
    totale_pannelli_ordini_di_produzione.totale_pannelli, ISNULL(pannelli_caricati.pannelli_caricati, 0) AS pannelli_caricati, CASE WHEN pannelli_caricati = totale_pannelli THEN 'true' ELSE 'false' END AS terminato, 
    dw_produzione.dbo.ordini_di_produzione.produzione_per_cabina, dw_produzione.dbo.ordini_di_produzione.assembly_id, dw_produzione.dbo.stati_ordini_di_produzione.stato
FROM            dw_produzione.dbo.ordini_di_produzione INNER JOIN
    dw_produzione.dbo.lotti ON dw_produzione.dbo.ordini_di_produzione.lotto = dw_produzione.dbo.lotti.id_lotto INNER JOIN
    dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN
    dw_produzione.dbo.stazioni ON dw_produzione.dbo.distinta_ordini_di_produzione.stazione = dw_produzione.dbo.stazioni.id_stazione INNER JOIN
        (SELECT        ordine_di_produzione AS id_ordine_di_produzione, COUNT(id_distinta) AS totale_pannelli
          FROM            dw_produzione.dbo.distinta_ordini_di_produzione AS distinta_ordini_di_produzione_1
          WHERE        (stazione =
                                        (SELECT        id_stazione
                                          FROM            dw_produzione.dbo.stazioni AS stazioni_1
                                          WHERE        (nome = 'incollaggio')))
          GROUP BY ordine_di_produzione) AS totale_pannelli_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = totale_pannelli_ordini_di_produzione.id_ordine_di_produzione INNER JOIN
    dw_produzione.dbo.stati_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.stati_ordini_di_produzione.ordine_di_produzione AND 
    dw_produzione.dbo.stazioni.id_stazione = dw_produzione.dbo.stati_ordini_di_produzione.stazione LEFT OUTER JOIN
        (SELECT        distinta_ordini_di_produzione_2.ordine_di_produzione AS id_ordine_di_produzione, COUNT(pannelli_caricati_1.id_distinta) AS pannelli_caricati, distinta_ordini_di_produzione_2.stazione
          FROM            dw_produzione.dbo.distinta_ordini_di_produzione AS distinta_ordini_di_produzione_2 INNER JOIN
                                    dbo.pannelli_caricati AS pannelli_caricati_1 ON distinta_ordini_di_produzione_2.id_distinta = pannelli_caricati_1.id_distinta
          GROUP BY distinta_ordini_di_produzione_2.ordine_di_produzione, distinta_ordini_di_produzione_2.stazione
          HAVING         (distinta_ordini_di_produzione_2.stazione =
                                        (SELECT        id_stazione
                                          FROM            dw_produzione.dbo.stazioni AS stazioni_2
                                          WHERE        (nome = 'incollaggio')))) AS pannelli_caricati ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = pannelli_caricati.id_ordine_di_produzione
WHERE        (dw_produzione.dbo.stazioni.nome = 'incollaggio') AND (dw_produzione.dbo.ordini_di_produzione.eliminato = 'false') AND (dw_produzione.dbo.stati_ordini_di_produzione.stato = 'aperto')
ORDER BY terminato, dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione DESC";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $ordine_di_produzione["id_ordine_di_produzione"]=$row2['id_ordine_di_produzione'];
            $ordine_di_produzione["ordine_di_produzione"]=utf8_encode($row2['ordine_di_produzione']);
            $ordine_di_produzione["id_lotto"]=$row2['id_lotto'];
            $ordine_di_produzione["lotto"]=$row2['lotto'];
            $ordine_di_produzione["totale_pannelli"]=$row2['totale_pannelli'];
            $ordine_di_produzione["pannelli_caricati"]=$row2['pannelli_caricati'];
            $ordine_di_produzione["terminato"]=$row2['terminato'];
            $ordine_di_produzione["produzione_per_cabina"]=filter_var($row2['produzione_per_cabina'], FILTER_VALIDATE_BOOLEAN);
            $ordine_di_produzione["assembly_id"]=utf8_encode($row2['assembly_id']);

            array_push($ordini_di_produzione,$ordine_di_produzione);
        }
    }
    else
        die("error");

    echo json_encode($ordini_di_produzione);

?>