<?php

    include "connessione.php";

    $dime=[];

    $query2="SELECT * FROM anagrafica_dime";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $dima["id_dima"]=$row2['id_dima'];
            $dima["nome"]=$row2['nome'];
            $dima["OffsetPianoPannelloDeltaX"]=$row2['OffsetPianoPannelloDeltaX'];
            $dima["OffsetPianoPannelloDeltaY"]=$row2['OffsetPianoPannelloDeltaY'];
            $dima["OffsetPianoPannelloDeltaZ"]=$row2['OffsetPianoPannelloDeltaZ'];
            $dima["OffsetPianoPannelloDeltaAlpha"]=$row2['OffsetPianoPannelloDeltaAlpha'];
            $dima["OffsetPianoPannelloDeltaBeta"]=$row2['OffsetPianoPannelloDeltaBeta'];
            $dima["OffsetPianoPannelloDeltaGamma"]=$row2['OffsetPianoPannelloDeltaGamma'];
            $dima["NumeroDima"]=$row2['NumeroDima'];
            $dima["1OffsetPianoPannelloDeltaX"]=$row2['1OffsetPianoPannelloDeltaX'];
            $dima["1OffsetPianoPannelloDeltaY"]=$row2['1OffsetPianoPannelloDeltaY'];
            $dima["1OffsetPianoPannelloDeltaZ"]=$row2['1OffsetPianoPannelloDeltaZ'];
            $dima["1OffsetPianoPannelloDeltaAlpha"]=$row2['1OffsetPianoPannelloDeltaAlpha'];
            $dima["1OffsetPianoPannelloDeltaBeta"]=$row2['1OffsetPianoPannelloDeltaBeta'];
            $dima["1OffsetPianoPannelloDeltaGamma"]=$row2['1OffsetPianoPannelloDeltaGamma'];
            $dima["descrizione"]=$row2['descrizione'];
            $dima["hidden"] = $row2['hidden'] === 'true'? true: false;

            array_push($dime,$dima);
        }
    }
    else
        die("error");

    echo json_encode($dime);

?>