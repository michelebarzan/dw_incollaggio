<?php

    include "connessione.php";

    $id_distinta=$_REQUEST['id_distinta'];
    $faccia=$_REQUEST['faccia'];
    $configurazione=$_REQUEST['configurazione'];

    if($configurazione == "BF" || $configurazione == "bf")
    {
        $query30="SELECT * FROM dw_incollaggio.dbo.pannelli_linea WHERE id_distinta=$id_distinta AND faccia='retro'";
        $result30=sqlsrv_query($conn,$query30);
        if($result30==FALSE)
            die("error2".$query30);
        else
        {
            $rows = sqlsrv_has_rows( $result30 );
            if ($rows === true)
            {
                $query3="EXEC insert_incollaggio_lana";
                $result3=sqlsrv_query($conn,$query3);
                if($result3==FALSE)
                    die("error2".$query3);
                else
                {
                    $query4="INSERT INTO [dbo].[pannelli_prodotti] ([id_distinta],[faccia],[bancale],[tempo_di_percorrenza])
                            SELECT $id_distinta,'retro',(SELECT MAX(id_bancale) AS id_bancale FROM dbo.anagrafica_bancali WHERE (stato = 'aperto')),(SELECT DATEDIFF(second, dbo.pannelli_linea.dataOra, GETDATE()) AS DateDiff FROM dbo.pannelli_linea INNER JOIN dbo.anagrafica_stazioni ON dbo.pannelli_linea.stazione = dbo.anagrafica_stazioni.id_stazione WHERE (dbo.pannelli_linea.id_distinta = $id_distinta) AND (dbo.pannelli_linea.faccia = 'retro') AND (dbo.anagrafica_stazioni.nome = 'caricamento'))";
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

                            $query15="DELETE FROM fogli_lana_pannelli WHERE id_distinta=$id_distinta AND faccia='retro'";
                            $result15=sqlsrv_query($conn,$query15);
                            if($result15==FALSE)
                                die("error2".$query15);
                        }
                    }
                    else
                        die("error".$query4);
                }
            }
        }
    }

    $query2="INSERT INTO [dbo].[pannelli_prodotti] ([id_distinta],[faccia],[bancale],[tempo_di_percorrenza])
            SELECT $id_distinta,'$faccia',(SELECT MAX(id_bancale) AS id_bancale FROM dbo.anagrafica_bancali WHERE (stato = 'aperto')),(SELECT DATEDIFF(second, dbo.pannelli_linea.dataOra, GETDATE()) AS DateDiff FROM dbo.pannelli_linea INNER JOIN dbo.anagrafica_stazioni ON dbo.pannelli_linea.stazione = dbo.anagrafica_stazioni.id_stazione WHERE (dbo.pannelli_linea.id_distinta = $id_distinta) AND (dbo.pannelli_linea.faccia = '$faccia') AND (dbo.anagrafica_stazioni.nome = 'caricamento'))";
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

            $query16="DELETE FROM fogli_lana_pannelli WHERE id_distinta=$id_distinta AND faccia='$faccia'";
            $result16=sqlsrv_query($conn,$query16);
            if($result16==FALSE)
                die("error2".$query16);
        }
    }
    else
        die("error1".$query2);

    if($faccia == "fronte")
    {
        $database = "dw_produzione";
        include "connessioneDb.php";

        $query17="SELECT id_stazione FROM stazioni WHERE nome = 'assemblaggio_byrb'";
        $result17=sqlsrv_query($conn,$query17);
        if($result17==TRUE)
        {
            while($row17=sqlsrv_fetch_array($result17))
            {
                $id_stazione = $row17["id_stazione"];
            }
        }
        else
            die("error");

        $query18="DELETE FROM pannelli_prodotti_ordini_di_produzione_utenti WHERE id_pannello_prodotto IN (SELECT id_pannello_prodotto FROM pannelli_prodotti_ordini_di_produzione WHERE id_distinta = $id_distinta AND stazione = $id_stazione)";
        $result18=sqlsrv_query($conn,$query18);
        if($result18==FALSE)
            die("error".$query18);

        $query19="DELETE FROM pannelli_prodotti_ordini_di_produzione WHERE id_distinta = $id_distinta AND stazione = $id_stazione";
        $result19=sqlsrv_query($conn,$query19);
        if($result19==FALSE)
            die("error".$query19);
            
        $query20="INSERT INTO pannelli_prodotti_ordini_di_produzione (id_distinta,dataOra,stazione,errato) VALUES ($id_distinta, GETDATE(), $id_stazione,'false')";
        $result20=sqlsrv_query($conn,$query20);
        if($result20==FALSE)
            die("error".$query20);

        $query21="SELECT DISTINCT dw_incollaggio.dbo.distinta_pannelli_prodotti.utente
                FROM dw_incollaggio.dbo.distinta_pannelli_prodotti INNER JOIN
                                        dw_incollaggio.dbo.pannelli_prodotti ON dw_incollaggio.dbo.distinta_pannelli_prodotti.pannello_prodotto = dw_incollaggio.dbo.pannelli_prodotti.id_pannello_prodotto
                WHERE (dw_incollaggio.dbo.pannelli_prodotti.id_distinta = $id_distinta) AND (dw_incollaggio.dbo.distinta_pannelli_prodotti.faccia = 'fronte') AND dw_incollaggio.dbo.distinta_pannelli_prodotti.utente <> (SELECT id_utente FROM utenti_mes WHERE username = 'stored_procedure')";
        $result21=sqlsrv_query($conn,$query21);
        if($result21==TRUE)
        {
            while($row21=sqlsrv_fetch_array($result21))
            {
                $id_utente = $row21["utente"];
                
                $query22="INSERT INTO pannelli_prodotti_ordini_di_produzione_utenti (id_pannello_prodotto,utente) SELECT id_pannello_prodotto, $id_utente FROM pannelli_prodotti_ordini_di_produzione WHERE id_distinta = $id_distinta AND stazione = $id_stazione";
                $result22=sqlsrv_query($conn,$query22);
                if($result22==FALSE)
                    die("error".$query22);
            }
        }
        else
            die("error");
    }

?>