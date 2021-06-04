<?php

    include "connessione.php";

    $id_bancale=$_REQUEST["id_bancale"];
    $id_utente=$_REQUEST["id_utente"];

    $query2="UPDATE dbo.anagrafica_bancali SET stato='chiuso', utenteChiusura=$id_utente, dataOraChiusura=GETDATE() WHERE id_bancale=$id_bancale";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==FALSE)
        die("error");

?>