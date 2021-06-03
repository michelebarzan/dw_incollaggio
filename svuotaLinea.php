<?php

    include "connessione.php";

    $q2="DELETE FROM [dbo].[pannelli_linea]";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }

?>