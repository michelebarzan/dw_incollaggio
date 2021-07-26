<?php

    include "connessione.php";

    $pannello=[];

    $query2="SELECT DISTINCT 
                TOP (100) PERCENT dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta, db_tecnico.dbo.pannelli.id_pannello, db_tecnico.dbo.pannelli.codice_pannello, 
                dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina, dw_produzione.dbo.distinta_ordini_di_produzione.pannello, dw_produzione.dbo.filtro_pannelli.elettrificato, db_tecnico.dbo.pannelli.profilo, 
                dw_produzione.dbo.filtro_pannelli.configurazione, db_tecnico.dbo.lamiere.ang, db_tecnico.dbo.lamiere.lung1, db_tecnico.dbo.lamiere.lung2, db_tecnico.dbo.lamiere.halt, pannello_precedente.id_incollaggio
            FROM dw_produzione.dbo.ordini_di_produzione INNER JOIN
                dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN
                db_tecnico.dbo.pannelli ON dw_produzione.dbo.distinta_ordini_di_produzione.pannello = db_tecnico.dbo.pannelli.id_pannello INNER JOIN
                dw_produzione.dbo.filtro_pannelli ON db_tecnico.dbo.pannelli.codice_pannello = dw_produzione.dbo.filtro_pannelli.CODPAS INNER JOIN
                db_tecnico.dbo.lamiere ON db_tecnico.dbo.pannelli.id_lamiera = db_tecnico.dbo.lamiere.id_lamiera INNER JOIN
                dbo.pannelli_linea ON dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta = dbo.pannelli_linea.id_distinta INNER JOIN
                    (SELECT MAX(pannelli_linea_1.id_incollaggio) AS id_incollaggio
                    FROM dbo.pannelli_linea AS pannelli_linea_1 INNER JOIN
                                                dbo.anagrafica_stazioni ON pannelli_linea_1.stazione = dbo.anagrafica_stazioni.id_stazione
                    WHERE (dbo.anagrafica_stazioni.nome = 'caricamento')) AS pannello_precedente ON dbo.pannelli_linea.id_incollaggio = pannello_precedente.id_incollaggio
            ORDER BY db_tecnico.dbo.pannelli.codice_pannello";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $pannello["id_distinta"]=$row2['id_distinta'];
            $pannello["id_incollaggio"]=$row2['id_incollaggio'];
            $pannello["id_pannello"]=$row2['id_pannello'];
            $pannello["codice_pannello"]=$row2['codice_pannello'];
            $pannello["elettrificato"]=$row2['elettrificato'];
            $pannello["configurazione"]=strtoupper($row2['configurazione']);
            $pannello["profilo"]=$row2['profilo'];
            $pannello["ang"]=$row2['ang'];
            $pannello["halt"]=$row2['halt'];
            $pannello["lung1"]=$row2['lung1'];
            $pannello["lung2"]=$row2['lung2'];
        }
    }
    else
        die("error");

    echo json_encode($pannello);

?>