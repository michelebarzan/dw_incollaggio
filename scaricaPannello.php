<?php

    include "connessione.php";

    $id_distinta=$_REQUEST['id_distinta'];
    $faccia=$_REQUEST['faccia'];
    $configurazione=$_REQUEST['configurazione'];

    if($configurazione == "BF" || $configurazione == "bf")
    {
        $query3="EXEC insert_incollaggio_lana";
        $result3=sqlsrv_query($conn,$query3);
        if($result3==FALSE)
            die("error2".$query3);
        else
        {
            $query4="INSERT INTO [dbo].[pannelli_prodotti] ([id_distinta],[faccia],[bancale],[tempo_di_percorrenza])
                    SELECT $id_distinta,'retro',(SELECT id_bancale FROM dbo.anagrafica_bancali WHERE (stato = 'aperto')),(SELECT DATEDIFF(second, dbo.pannelli_linea.dataOra, GETDATE()) AS DateDiff FROM dbo.pannelli_linea INNER JOIN dbo.anagrafica_stazioni ON dbo.pannelli_linea.stazione = dbo.anagrafica_stazioni.id_stazione WHERE (dbo.pannelli_linea.id_distinta = $id_distinta) AND (dbo.pannelli_linea.faccia = 'retro') AND (dbo.anagrafica_stazioni.nome = 'caricamento'))";
            $result4=sqlsrv_query($conn,$query4);
            if($result4==TRUE)
            {
                $query7="INSERT INTO [dbo].[distinta_pannelli_prodotti]
                                ([pannello_prodotto]
                                ,[stazione]
                                ,[utente]
                                ,[dataOra]
                                ,[faccia])
                        SELECT (SELECT MAX(id_pannello_prodotto) FROM pannelli_prodotti WHERE id_distinta = $id_distinta AND faccia='retro'),[stazione],[utente],[dataOra],[faccia] 
                        FROM pannelli_linea 
                        WHERE id_distinta=$id_distinta AND faccia='retro'";
                $result7=sqlsrv_query($conn,$query7);
                if($result7==FALSE)
                    die("error2".$query7);
                else
                {
                    $query5="DELETE FROM pannelli_linea WHERE id_distinta=$id_distinta AND faccia='retro'";
                    $result5=sqlsrv_query($conn,$query5);
                    if($result5==FALSE)
                        die("error2".$query5);
                }
            }
            else
                die("error".$query4);
        }
    }

    $query2="INSERT INTO [dbo].[pannelli_prodotti] ([id_distinta],[faccia],[bancale],[tempo_di_percorrenza])
            SELECT $id_distinta,'$faccia',(SELECT id_bancale FROM dbo.anagrafica_bancali WHERE (stato = 'aperto')),(SELECT DATEDIFF(second, dbo.pannelli_linea.dataOra, GETDATE()) AS DateDiff FROM dbo.pannelli_linea INNER JOIN dbo.anagrafica_stazioni ON dbo.pannelli_linea.stazione = dbo.anagrafica_stazioni.id_stazione WHERE (dbo.pannelli_linea.id_distinta = $id_distinta) AND (dbo.pannelli_linea.faccia = '$faccia') AND (dbo.anagrafica_stazioni.nome = 'caricamento'))";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        $query6="INSERT INTO [dbo].[distinta_pannelli_prodotti]
                        ([pannello_prodotto]
                        ,[stazione]
                        ,[utente]
                        ,[dataOra]
                        ,[faccia])
                SELECT (SELECT MAX(id_pannello_prodotto) FROM pannelli_prodotti WHERE id_distinta = $id_distinta AND faccia='$faccia'),[stazione],[utente],[dataOra],[faccia] 
                FROM pannelli_linea 
                WHERE id_distinta=$id_distinta AND faccia='$faccia'";
        $result6=sqlsrv_query($conn,$query6);
        if($result6==FALSE)
            die("error2".$query6);
        else
        {
            $query="DELETE FROM pannelli_linea WHERE id_distinta=$id_distinta AND faccia='$faccia'";
            $result=sqlsrv_query($conn,$query);
            if($result==FALSE)
                die("error2".$query);
        }
    }
    else
        die("error1".$query2);

?>