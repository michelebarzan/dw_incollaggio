<?php

    include "connessione.php";

    $id_distinta=$_REQUEST["id_distinta"];

    $q="DELETE FROM pannelli_linea WHERE id_distinta=$id_distinta";
    $r=sqlsrv_query($conn,$q);
    if($r==FALSE)
    {
        die("error");
    }
    
?>