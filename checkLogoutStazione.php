<?php

    include "connessione.php";

    $id_stazione=$_REQUEST["id_stazione"];

    $stmt = sqlsrv_query( $conn, "SELECT * FROM [logout_stazioni] WHERE stazione=$id_stazione");

    if ($stmt)
    {
        $rows = sqlsrv_has_rows( $stmt );
        if($rows)
        {
            $q2="DELETE FROM [logout_stazioni] WHERE stazione=$id_stazione";
            $r2=sqlsrv_query($conn,$q2);
            if($r2==FALSE)
            {
                die("error");
            }
        }
        echo json_encode($rows);
    }
    else
        die("error");

?>