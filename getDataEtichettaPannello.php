<?php

    $database = "dw_produzione";
    include "connessioneDb.php";

    $id_distinta=$_REQUEST["id_distinta"];

    $query2="SELECT dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina,  dw_produzione.dbo.commesse.commessa, dw_produzione.dbo.commesse.descrizione AS descrizione_commessa, DATEPART(yy, GETDATE()) AS year, db_tecnico.dbo.pannelli.codice_pannello, 
                                    db_tecnico.dbo.sviluppi.codice_sviluppo AS xside, ISNULL(db_tecnico.dbo.sviluppi_r.codice_sviluppo, '') AS yside, CASE WHEN lamiere.lung2 = 0 THEN CONVERT(varchar(MAX), lamiere.lung1) ELSE CONVERT(varchar(MAX), 
                                    lamiere.lung1) + '+' + CONVERT(varchar(MAX), lamiere.lung2) END AS larghezza, db_tecnico.dbo.lamiere.tipo, db_tecnico.dbo.lamiere.halt AS altezza, ISNULL(dw_produzione.dbo.finiture_cabine.finitura, '') AS finitura_lato_x, 
                                    '' AS finitura_lato_y, db_tecnico.dbo.pannelli.descrizionetec AS codice_certificato, db_tecnico.dbo.pannelli.resis AS classe, dw_produzione.dbo.lotti.id_materiale, dw_produzione.dbo.lotti.lotto, 
                                    REPLACE(db_tecnico.dbo.pannelli.descrizione, { fn CONCAT(db_tecnico.dbo.pannelli.resis, ' ') }, '') AS descrizione_pannello
            FROM dw_produzione.dbo.distinta_ordini_di_produzione INNER JOIN
                                    dw_produzione.dbo.ordini_di_produzione ON dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione = dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione INNER JOIN
                                    dw_produzione.dbo.lotti ON dw_produzione.dbo.ordini_di_produzione.lotto = dw_produzione.dbo.lotti.id_lotto INNER JOIN
                                    dw_produzione.dbo.commesse ON dw_produzione.dbo.lotti.commessa = dw_produzione.dbo.commesse.id_commessa INNER JOIN
                                    db_tecnico.dbo.pannelli ON dw_produzione.dbo.distinta_ordini_di_produzione.pannello = db_tecnico.dbo.pannelli.id_pannello INNER JOIN
                                    db_tecnico.dbo.lamiere ON db_tecnico.dbo.pannelli.id_lamiera = db_tecnico.dbo.lamiere.id_lamiera INNER JOIN
                                    db_tecnico.dbo.sviluppi ON db_tecnico.dbo.lamiere.id_sviluppo = db_tecnico.dbo.sviluppi.id_sviluppo LEFT OUTER JOIN
                                    dw_produzione.dbo.finiture_cabine ON dw_produzione.dbo.commesse.id_commessa = dw_produzione.dbo.finiture_cabine.commessa AND 
                                    db_tecnico.dbo.lamiere.finitura = dw_produzione.dbo.finiture_cabine.colonna_finitura AND 
                                    dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina = dw_produzione.dbo.finiture_cabine.numero_cabina LEFT OUTER JOIN
                                    db_tecnico.dbo.sviluppi_r INNER JOIN
                                    db_tecnico.dbo.lamiere_r ON db_tecnico.dbo.sviluppi_r.id_sviluppo_r = db_tecnico.dbo.lamiere_r.id_sviluppo_r ON db_tecnico.dbo.pannelli.id_lamiera_r = db_tecnico.dbo.lamiere_r.id_lamiera_r
            WHERE (dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta = $id_distinta)";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $data["commessa"]=utf8_encode($row2['commessa']);
            $data["descrizione_commessa"]=utf8_encode($row2['descrizione_commessa']);
            $data["year"]=$row2['year'];
            $data["codice_pannello"]=utf8_encode($row2['codice_pannello']);
            $data["descrizione_pannello"]=utf8_encode($row2['descrizione_pannello']);
            $data["xside"]=utf8_encode($row2['xside']);
            $data["yside"]=utf8_encode($row2['yside']);
            $data["larghezza"]=$row2['larghezza'];
            $data["altezza"]=$row2['altezza'];
            $data["finitura_lato_x"]=utf8_encode($row2['finitura_lato_x']);
            $data["finitura_lato_y"]=utf8_encode($row2['finitura_lato_y']);
            $data["codice_certificato"]=utf8_encode($row2['codice_certificato']);
            $data["classe"]=utf8_encode($row2['classe']);
            $data["id_materiale"]=utf8_encode($row2['id_materiale']);
            $data["lotto"]=utf8_encode($row2['lotto']);
            $data["tipo"]=utf8_encode($row2['tipo']);
            $data["numero_cabina"]=utf8_encode($row2['numero_cabina']);
            $data["id_distinta"]=$id_distinta;
        }
    }
    else
        die("error\n".$query2);

    echo json_encode($data);

?>