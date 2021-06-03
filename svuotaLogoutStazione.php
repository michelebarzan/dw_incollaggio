<?php

    include "connessione.php";

    $id_stazione=$_REQUEST["id_stazione"];
    $q2="DELETE FROM [dbo].[logout_stazioni] WHERE stazione=$id_stazione";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }

?>