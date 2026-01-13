<?php

    include "connessione.php";

    $codice_pannello = $_REQUEST["codice_pannello"];
    $id_ordine_di_produzione = $_REQUEST["id_ordine_di_produzione"];

    $query2="SELECT DISTINCT ISNULL(dbo.fresature_tagli_lana.fresatura_sinistra, 'false') AS fresatura_sinistra, t.lung
            FROM (SELECT db_tecnico.dbo.pannelli.profilo, db_tecnico.dbo.pannelli.id_pannello, db_tecnico.dbo.pannelli.codice_pannello, CASE WHEN db_tecnico.dbo.pannelli.id_lamiera_r IS NULL 
                                                                THEN 'mf' ELSE 'bf' END AS configurazione, db_tecnico.dbo.lamiere.tipo, MAX(db_tecnico.dbo.lane.spess) AS spess, db_tecnico.dbo.pannelli.resis, 
                                                                db_tecnico.dbo.lamiere.lung1 + db_tecnico.dbo.lamiere.lung2 AS lung
                                    FROM db_tecnico.dbo.lane_pannelli INNER JOIN
                                                                db_tecnico.dbo.lane ON db_tecnico.dbo.lane_pannelli.id_lana = db_tecnico.dbo.lane.id_lana INNER JOIN
                                                                db_tecnico.dbo.pannelli INNER JOIN
                                                                db_tecnico.dbo.lamiere ON db_tecnico.dbo.pannelli.id_lamiera = db_tecnico.dbo.lamiere.id_lamiera ON 
                                                                db_tecnico.dbo.lane_pannelli.id_pannello = db_tecnico.dbo.pannelli.id_pannello
                                    GROUP BY db_tecnico.dbo.pannelli.id_lamiera_r, db_tecnico.dbo.pannelli.profilo, db_tecnico.dbo.pannelli.id_pannello, db_tecnico.dbo.pannelli.codice_pannello, 
                                                                db_tecnico.dbo.lamiere.tipo, db_tecnico.dbo.pannelli.resis, db_tecnico.dbo.lamiere.lung1, db_tecnico.dbo.lamiere.lung2) AS t INNER JOIN
                                    dw_produzione.dbo.distinta_ordini_di_produzione ON t.id_pannello = dw_produzione.dbo.distinta_ordini_di_produzione.pannello INNER JOIN
                                    dw_produzione.dbo.stazioni ON dw_produzione.dbo.distinta_ordini_di_produzione.stazione = dw_produzione.dbo.stazioni.id_stazione LEFT OUTER JOIN
                                    dbo.fresature_tagli_lana ON t.profilo = dbo.fresature_tagli_lana.profilo AND t.tipo = dbo.fresature_tagli_lana.tipo AND t.resis = dbo.fresature_tagli_lana.resistenza AND 
                                    t.configurazione = dbo.fresature_tagli_lana.configurazione
            WHERE (dw_produzione.dbo.stazioni.nome = 'assemblaggio_byrb') AND (dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione = $id_ordine_di_produzione) AND (t.codice_pannello = '$codice_pannello')";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $obj["fresatura_sinistra"] = filter_var($row2["fresatura_sinistra"], FILTER_VALIDATE_BOOLEAN);
            $obj["lung"] = $row2["lung"];

            echo json_encode($obj);
        }
    }
    else
        die("error");

?>