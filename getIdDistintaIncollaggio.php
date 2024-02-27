<?php

    $database = "dw_produzione";
    include "connessioneDb.php";

    $id_distinta=$_REQUEST["id_distinta"];

    $id_distinta_incollaggio=[];

    $query2="SELECT distinta_ordini_di_produzione_incollaggio.id_distinta
            FROM dbo.distinta_ordini_di_produzione INNER JOIN
                                        (SELECT *
                                        FROM dbo.distinta_ordini_di_produzione AS distinta_ordini_di_produzione_1
                                        WHERE (stazione =
                                                                        (SELECT id_stazione
                                                                        FROM dbo.stazioni
                                                                        WHERE (nome = 'assemblaggio_byrb')))) AS distinta_ordini_di_produzione_incollaggio ON dbo.distinta_ordini_di_produzione.pannello = distinta_ordini_di_produzione_incollaggio.pannello AND 
                                    dbo.distinta_ordini_di_produzione.numero_cabina = distinta_ordini_di_produzione_incollaggio.numero_cabina
            WHERE (dbo.distinta_ordini_di_produzione.id_distinta = $id_distinta)";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            array_push($id_distinta_incollaggio,$row2['id_distinta']);
        }
    }
    else
        die("error");

    echo json_encode($id_distinta_incollaggio);

?>