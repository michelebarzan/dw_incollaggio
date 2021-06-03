<?php

    include "connessione.php";

    $id_stazioni=json_decode($_REQUEST["JSONid_stazioni"]);
    foreach ($id_stazioni as $id_stazione)
    {
        $q2="INSERT INTO [dbo].[logout_stazioni] ([stazione]) VALUES ($id_stazione)";
        $r2=sqlsrv_query($conn,$q2);
        if($r2==FALSE)
        {
            die("error");
        }
    }

?>