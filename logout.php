<?php

    include "connessione.php";

    session_start();

    $tipo = "utenti";
    $id_utente= $_SESSION ['id_utente'];

    $q3="INSERT INTO dw_produzione.[dbo].[sessioni_utenti]
        ([stazione]
        ,[utente]
        ,[tipologia_lavorazione]
        ,[dataOra]
        ,[tipo])
        SELECT (SELECT id_stazione FROM dw_produzione.dbo.stazioni WHERE nome = 'assemblaggio_byrb'),".$id_utente.",(SELECT TOP(1) [id_tipologia_lavorazione] FROM [dw_produzione].[dbo].[tipologie_lavorazioni] WHERE nome = 'produzione_odp'),GETDATE(),'stop'";
    $r3=sqlsrv_query($conn,$q3);
    if($r3==FALSE)
        echo "error";

    $_SESSION=array();
    session_destroy();

?>