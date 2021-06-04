<?php

    include "connessione.php";

    $id_bancale=$_REQUEST["id_bancale"];

    $bancale=null;

    $query2="SELECT * FROM dbo.anagrafica_bancali WHERE id_bancale=$id_bancale";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $bancale["id_bancale"]=$row2['id_bancale'];
            $bancale["dataOraApertura"]=$row2['dataOraApertura'];
            $bancale["dataOraChiusura"]=$row2['dataOraChiusura'];
            $bancale["utenteApertura"]=$row2['utenteApertura'];
            $bancale["utenteChiusura"]=$row2['utenteChiusura'];
            $bancale["stato"]=$row2['stato'];
            $bancale["pannelli"]=[];

            $query="SELECT DISTINCT 
            dw_produzione.dbo.ordini_di_produzione.nome, dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina, db_tecnico.dbo.pannelli.codice_pannello, dbo.pannelli_prodotti.id_distinta, 
            dbo.pannelli_prodotti.id_pannello_prodotto, dw_produzione.dbo.filtro_pannelli.elettrificato
FROM            dbo.pannelli_prodotti INNER JOIN
            dw_produzione.dbo.distinta_ordini_di_produzione ON dbo.pannelli_prodotti.id_distinta = dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta INNER JOIN
            dw_produzione.dbo.ordini_di_produzione ON dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione = dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione INNER JOIN
            db_tecnico.dbo.pannelli ON dw_produzione.dbo.distinta_ordini_di_produzione.pannello = db_tecnico.dbo.pannelli.id_pannello INNER JOIN
            dw_produzione.dbo.filtro_pannelli ON db_tecnico.dbo.pannelli.codice_pannello = dw_produzione.dbo.filtro_pannelli.CODPAS
            WHERE (dbo.pannelli_prodotti.bancale = ".$row2['id_bancale'].")
                    ORDER BY dbo.pannelli_prodotti.id_pannello_prodotto DESC";
            $result=sqlsrv_query($conn,$query);
            if($result==TRUE)
            {
                while($row=sqlsrv_fetch_array($result))
                {
                    $pannello["ordine_di_produzione"]=$row['nome'];
                    $pannello["numero_cabina"]=$row['numero_cabina'];
                    $pannello["codice_pannello"]=$row['codice_pannello'];
                    $pannello["id_distinta"]=$row['id_distinta'];
                    $pannello["elettrificato"]=$row['elettrificato'];

                    array_push($bancale["pannelli"],$pannello);
                }
            }
            else
                die("error2".$query);
        }
    }
    else
        die("error");

    echo json_encode($bancale);

?>