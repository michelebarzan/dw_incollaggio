<?php
    session_start();

    $id_distinta=$_REQUEST['id_distinta'];
    $faccia=$_REQUEST['faccia'];
    $configurazione=$_REQUEST['configurazione'];

    //OPERAZIONI SU dw_incollaggio-----------------------------------------------------------------------------------------------------------

    $database = "dw_produzione";
    include "connessioneDb.php";
    $conn40 = $conn;

    $database = "dw_produzione";
    include "connessioneDb1.php";
    $conn8 = $conn;

    if($configurazione == "BF" || $configurazione == "bf")
    {
        $query30="SELECT * FROM dw_incollaggio.dbo.pannelli_linea WHERE id_distinta=$id_distinta AND faccia='retro'";
        $result30=sqlsrv_query($conn40,$query30);
        if($result30===FALSE)
            die("error2".$query30);
        else
        {
            $rows = sqlsrv_has_rows( $result30 );
            if ($rows === true)
            {
                $query3="EXEC dw_incollaggio.dbo.insert_incollaggio_lana";
                $result3=sqlsrv_query($conn40,$query3);
                if($result3===FALSE)
                    die("error2".$query3);
                else
                {
                    $query4="INSERT INTO dw_incollaggio.[dbo].[pannelli_prodotti] ([id_distinta],[faccia],[bancale],[tempo_di_percorrenza])
                            SELECT $id_distinta,'retro',(SELECT MAX(id_bancale) AS id_bancale FROM dw_incollaggio.dbo.anagrafica_bancali WHERE (stato = 'aperto')),(SELECT DATEDIFF(second, dw_incollaggio.dbo.pannelli_linea.dataOra, GETDATE()) AS DateDiff FROM dw_incollaggio.dbo.pannelli_linea INNER JOIN dw_incollaggio.dbo.anagrafica_stazioni ON dw_incollaggio.dbo.pannelli_linea.stazione = dw_incollaggio.dbo.anagrafica_stazioni.id_stazione WHERE (dw_incollaggio.dbo.pannelli_linea.id_distinta = $id_distinta) AND (dw_incollaggio.dbo.pannelli_linea.faccia = 'retro') AND (dw_incollaggio.dbo.anagrafica_stazioni.nome = 'caricamento'))";
                    $result4=sqlsrv_query($conn40,$query4);
                    if($result4==TRUE)
                    {
                        $query7="INSERT INTO dw_incollaggio.[dbo].[distinta_pannelli_prodotti]
                                        ([pannello_prodotto]
                                        ,[stazione]
                                        ,[utente]
                                        ,[dataOra]
                                        ,[faccia])
                                SELECT (SELECT MAX(id_pannello_prodotto) FROM dw_incollaggio.dbo.pannelli_prodotti WHERE id_distinta = $id_distinta AND faccia='retro'),[stazione],[utente],[dataOra],[faccia] 
                                FROM dw_incollaggio.dbo.pannelli_linea 
                                WHERE id_distinta=$id_distinta AND faccia='retro'";
                        $result7=sqlsrv_query($conn40,$query7);
                        if($result7===FALSE)
                            die("error2".$query7);
                        else
                        {
                            $query5="DELETE FROM dw_incollaggio.dbo.pannelli_linea WHERE id_distinta=$id_distinta AND faccia='retro'";
                            $result5=sqlsrv_query($conn40,$query5);
                            if($result5===FALSE)
                                die("error2".$query5);

                            $query15="DELETE FROM dw_incollaggio.dbo.fogli_lana_pannelli WHERE id_distinta=$id_distinta AND faccia='retro'";
                            $result15=sqlsrv_query($conn40,$query15);
                            if($result15===FALSE)
                                die("error2".$query15);
                        }
                    }
                    else
                        die("error".$query4);
                }
            }
        }
    }

    $query2="INSERT INTO dw_incollaggio.[dbo].[pannelli_prodotti] ([id_distinta],[faccia],[bancale],[tempo_di_percorrenza])
            SELECT $id_distinta,'$faccia',(SELECT MAX(id_bancale) AS id_bancale FROM dw_incollaggio.dbo.anagrafica_bancali WHERE (stato = 'aperto')),(SELECT DATEDIFF(second, dw_incollaggio.dbo.pannelli_linea.dataOra, GETDATE()) AS DateDiff FROM dw_incollaggio.dbo.pannelli_linea INNER JOIN dw_incollaggio.dbo.anagrafica_stazioni ON dw_incollaggio.dbo.pannelli_linea.stazione = dw_incollaggio.dbo.anagrafica_stazioni.id_stazione WHERE (dw_incollaggio.dbo.pannelli_linea.id_distinta = $id_distinta) AND (dw_incollaggio.dbo.pannelli_linea.faccia = '$faccia') AND (dw_incollaggio.dbo.anagrafica_stazioni.nome = 'caricamento'))";
    $result2=sqlsrv_query($conn40,$query2);
    if($result2==TRUE)
    {
        $query6="INSERT INTO dw_incollaggio.[dbo].[distinta_pannelli_prodotti]
                        ([pannello_prodotto]
                        ,[stazione]
                        ,[utente]
                        ,[dataOra]
                        ,[faccia])
                SELECT (SELECT MAX(id_pannello_prodotto) FROM dw_incollaggio.dbo.pannelli_prodotti WHERE id_distinta = $id_distinta AND faccia='$faccia'),[stazione],[utente],[dataOra],[faccia] 
                FROM dw_incollaggio.dbo.pannelli_linea 
                WHERE id_distinta=$id_distinta AND faccia='$faccia'";
        $result6=sqlsrv_query($conn40,$query6);
        if($result6===FALSE)
            die("error2".$query6);
        else
        {
            $query="DELETE FROM dw_incollaggio.dbo.pannelli_linea WHERE id_distinta=$id_distinta AND faccia='$faccia'";
            $result=sqlsrv_query($conn40,$query);
            if($result===FALSE)
                die("error2".$query);

            $query16="DELETE FROM dw_incollaggio.dbo.fogli_lana_pannelli WHERE id_distinta=$id_distinta AND faccia='$faccia'";
            $result16=sqlsrv_query($conn40,$query16);
            if($result16===FALSE)
                die("error2".$query16);
        }
    }
    else
        die("error1".$query2);

    //OPERAZIONI SU dw_produzione-----------------------------------------------------------------------------------------------------------

    if($faccia == "fronte")
    {
        $query17="SELECT id_stazione FROM stazioni WHERE nome = 'assemblaggio_byrb'";
        $result17=sqlsrv_query($conn40,$query17);
        if ($result17 !== FALSE)
        {
            while($row17=sqlsrv_fetch_array($result17))
            {
                $id_stazione = $row17["id_stazione"];
            }
        }
        else
            die("errorA");

        $query18="DELETE FROM pannelli_prodotti_ordini_di_produzione_utenti WHERE id_pannello_prodotto IN (SELECT id_pannello_prodotto FROM pannelli_prodotti_ordini_di_produzione WHERE id_distinta = $id_distinta AND stazione = $id_stazione)";
        $result18=sqlsrv_query($conn40,$query18);
        $result18B=sqlsrv_query($conn8,$query18);
        if($result18===FALSE || $result18B===FALSE)
            die("error".$query18);

        $query19="DELETE FROM pannelli_prodotti_ordini_di_produzione WHERE id_distinta = $id_distinta AND stazione = $id_stazione";
        $result19=sqlsrv_query($conn40,$query19);
        $result19B=sqlsrv_query($conn8,$query19);
        if($result19===FALSE || $result19B===FALSE)
            die("error".$query19);
            
        $query20="INSERT INTO pannelli_prodotti_ordini_di_produzione (id_distinta,dataOra,stazione,errato) VALUES ($id_distinta, GETDATE(), $id_stazione,'false')";
        $result20=sqlsrv_query($conn40,$query20);
        $result20B=sqlsrv_query($conn8,$query20);
        if($result20===FALSE || $result20B===FALSE)
            die("error".$query20);

        $id_utenti = [];
        if($_SESSION['id_squadra_uscita'] == null || $_SESSION['id_squadra_uscita'] == "")
        {
            $query21="SELECT DISTINCT dw_incollaggio.dbo.distinta_pannelli_prodotti.utente
                    FROM dw_incollaggio.dbo.distinta_pannelli_prodotti INNER JOIN
                                            dw_incollaggio.dbo.pannelli_prodotti ON dw_incollaggio.dbo.distinta_pannelli_prodotti.pannello_prodotto = dw_incollaggio.dbo.pannelli_prodotti.id_pannello_prodotto
                    WHERE (dw_incollaggio.dbo.pannelli_prodotti.id_distinta = $id_distinta) AND (dw_incollaggio.dbo.distinta_pannelli_prodotti.faccia = 'fronte') AND dw_incollaggio.dbo.distinta_pannelli_prodotti.utente <> (SELECT id_utente FROM utenti_mes WHERE username = 'stored_procedure')";
            $result21=sqlsrv_query($conn40,$query21);
            if ($result21 !== FALSE)
            {
                while($row21=sqlsrv_fetch_array($result21))
                {
                    $id_utente = $row21["utente"];
                    
                    array_push($id_utenti,$id_utente);
                }
            }
            else
                die("errorB");
        }
        else
        {
            $query21="SELECT utente
                    FROM dw_produzione.dbo.utenti_squadre_mes
                    WHERE (squadra = " . $_SESSION['id_squadra_uscita'] . ")";
            $result21=sqlsrv_query($conn8,$query21);
            if ($result21 !== FALSE)
            {
                while($row21=sqlsrv_fetch_array($result21))
                {
                    $id_utente = $row21["utente"];
                    
                    array_push($id_utenti,$id_utente);
                }
            }
            else
                die("errorC");
        }
            
        foreach ($id_utenti as $id_utente)
        {
            $query22="INSERT INTO pannelli_prodotti_ordini_di_produzione_utenti (id_pannello_prodotto,utente) SELECT id_pannello_prodotto, $id_utente FROM pannelli_prodotti_ordini_di_produzione WHERE id_distinta = $id_distinta AND stazione = $id_stazione";
            $result22=sqlsrv_query($conn40,$query22);
            $result22B=sqlsrv_query($conn8,$query22);
            if($result22===FALSE || $result22B===FALSE)
                die("error".$query22);
        }

        echo $id_distinta;
    }

?>