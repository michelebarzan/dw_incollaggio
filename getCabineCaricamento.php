<?php

    include "connessione.php";

    $id_ordine_di_produzione=$_REQUEST["id_ordine_di_produzione"];

    $cabine=[];

    $query2="SELECT DISTINCT TOP (100) PERCENT dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina, ISNULL(pannelli_caricati.pannelli_caricati, 0) AS pannelli_caricati, totale_pannelli_ordini_di_produzione.totale_pannelli
    FROM            dw_produzione.dbo.ordini_di_produzione INNER JOIN
                             dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN
                                 (SELECT        COUNT(db_tecnico.dbo.pannelli.id_pannello) AS totale_pannelli, distinta_ordini_di_produzione_1.numero_cabina
                                   FROM            db_tecnico.dbo.pannelli INNER JOIN
                                                             dw_produzione.dbo.distinta_ordini_di_produzione AS distinta_ordini_di_produzione_1 ON db_tecnico.dbo.pannelli.id_pannello = distinta_ordini_di_produzione_1.pannello
                                   GROUP BY distinta_ordini_di_produzione_1.numero_cabina, distinta_ordini_di_produzione_1.ordine_di_produzione
                                   HAVING         (distinta_ordini_di_produzione_1.ordine_di_produzione = $id_ordine_di_produzione)) AS totale_pannelli_ordini_di_produzione ON 
                             dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina = totale_pannelli_ordini_di_produzione.numero_cabina LEFT OUTER JOIN
                                 (SELECT        COUNT(pannelli_1.id_pannello) AS pannelli_caricati, distinta_ordini_di_produzione_2.numero_cabina
                                   FROM            db_tecnico.dbo.pannelli AS pannelli_1 INNER JOIN
                                                             dw_produzione.dbo.distinta_ordini_di_produzione AS distinta_ordini_di_produzione_2 ON pannelli_1.id_pannello = distinta_ordini_di_produzione_2.pannello INNER JOIN
                                                             dbo.pannelli_caricati AS pannelli_caricati_1 ON distinta_ordini_di_produzione_2.id_distinta = pannelli_caricati_1.id_distinta
                                   GROUP BY distinta_ordini_di_produzione_2.numero_cabina, distinta_ordini_di_produzione_2.ordine_di_produzione
                                   HAVING         (distinta_ordini_di_produzione_2.ordine_di_produzione = $id_ordine_di_produzione)) AS pannelli_caricati ON dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina = pannelli_caricati.numero_cabina
    WHERE        (dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = $id_ordine_di_produzione)
    ORDER BY dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $cabina["numero_cabina"]=$row2["numero_cabina"];
            $cabina["totale_pannelli"]=$row2["totale_pannelli"];
            $cabina["pannelli_caricati"]=$row2["pannelli_caricati"];

            array_push($cabine,$cabina);
        }
    }
    else
        die("error");

    echo json_encode($cabine);

?>