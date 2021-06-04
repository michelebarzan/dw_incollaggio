<?php

    include "connessione.php";

    $id_bancale=$_REQUEST["id_bancale"];

    $query2="UPDATE dbo.anagrafica_bancali SET stato='aperto' WHERE id_bancale=$id_bancale";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==FALSE)
        die("error");

?>