<?php

    include "connessione.php";

    $q2="EXEC [dbo].[riavvia_linea]";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }

?>