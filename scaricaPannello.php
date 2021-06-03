<?php

    include "connessione.php";

    $id_distinta=$_REQUEST['id_distinta'];
    $faccia=$_REQUEST['faccia'];

    $query2="INSERT INTO [dbo].[pannelli_prodotti] ([id_distinta],[faccia],[bancale],[tempo_di_percorrenza])
            SELECT $id_distinta,'$faccia',(SELECT id_bancale FROM dbo.anagrafica_bancali WHERE (stato = 'aperto')),(SELECT DATEDIFF(second, dbo.pannelli_linea.dataOra, GETDATE()) AS DateDiff FROM dbo.pannelli_linea INNER JOIN dbo.anagrafica_stazioni ON dbo.pannelli_linea.stazione = dbo.anagrafica_stazioni.id_stazione WHERE (dbo.pannelli_linea.id_distinta = $id_distinta) AND (dbo.pannelli_linea.faccia = '$faccia') AND (dbo.anagrafica_stazioni.nome = 'caricamento'))";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        $query="DELETE FROM pannelli_linea WHERE id_distinta=$id_distinta AND faccia='$faccia'";
        $result=sqlsrv_query($conn,$query);
        if($result==FALSE)
            die("error2".$query);
    }
    else
        die("error1".$query2);

?>