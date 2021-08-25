<?php

    include "connessione.php";

    $pannelli=[];

    $query2="SELECT DISTINCT dbo.pannelli_linea.id_distinta, db_tecnico.dbo.pannelli.codice_pannello
            FROM dbo.pannelli_linea INNER JOIN dw_produzione.dbo.distinta_ordini_di_produzione ON dbo.pannelli_linea.id_distinta = dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta INNER JOIN db_tecnico.dbo.pannelli ON dw_produzione.dbo.distinta_ordini_di_produzione.pannello = db_tecnico.dbo.pannelli.id_pannello";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $pannello["id_distinta"]=$row2['id_distinta'];
            $pannello["codice_pannello"]=$row2['codice_pannello'];

            array_push($pannelli,$pannello);
        }
    }
    else
        die("error");

    echo json_encode($pannelli);

?>