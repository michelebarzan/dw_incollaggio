<?php

    include "connessione.php";

    $query2="EXEC insert_uscita";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==FALSE)
        die("error1");

?>