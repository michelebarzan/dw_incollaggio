<?php

    include "connessione.php";

    $id_distinta=$_REQUEST["id_distinta"];

    $q="DELETE FROM pannelli_linea WHERE id_distinta=$id_distinta";
    $r=sqlsrv_query($conn,$q);
    if($r==FALSE)
    {
        die("error");
    }

    $q2="DELETE FROM fogli_lana_pannelli WHERE id_distinta=$id_distinta";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }
    
?>