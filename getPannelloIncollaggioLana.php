<?php

    include "connessione.php";

    $pannello=null;

    $query2="SELECT dbo.pannelli_linea.id_incollaggio, db_tecnico.dbo.pannelli.id_pannello, db_tecnico.dbo.pannelli.codice_pannello, db_tecnico.dbo.pannelli.descrizione, db_tecnico.dbo.pannelli.profilo, 
                dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta, db_tecnico.dbo.lamiere.lung1, db_tecnico.dbo.lamiere.lung2, db_tecnico.dbo.lamiere.halt, dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina, 
                dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione, dw_produzione.dbo.ordini_di_produzione.nome AS nome_ordine_di_produzione, db_tecnico.dbo.lamiere.ang, 
                dw_produzione.dbo.filtro_pannelli.configurazione, dbo.pannelli_linea.faccia, db_tecnico.dbo.lamiere.tipo, db_tecnico.dbo.lamiere_r.lung1 AS lung1_r, db_tecnico.dbo.lamiere_r.lung2 AS lung2_r, 
                db_tecnico.dbo.lamiere_r.halt AS halt_r
            FROM dbo.pannelli_linea INNER JOIN
                dw_produzione.dbo.distinta_ordini_di_produzione ON dbo.pannelli_linea.id_distinta = dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta INNER JOIN
                db_tecnico.dbo.pannelli ON dw_produzione.dbo.distinta_ordini_di_produzione.pannello = db_tecnico.dbo.pannelli.id_pannello INNER JOIN
                db_tecnico.dbo.lamiere ON db_tecnico.dbo.lamiere.id_lamiera = db_tecnico.dbo.pannelli.id_lamiera INNER JOIN
                dw_produzione.dbo.ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN
                dbo.view_incollaggio_lana ON dbo.pannelli_linea.id_incollaggio = dbo.view_incollaggio_lana.id_incollaggio INNER JOIN
                dw_produzione.dbo.filtro_pannelli ON db_tecnico.dbo.pannelli.codice_pannello = dw_produzione.dbo.filtro_pannelli.CODPAS LEFT OUTER JOIN
                db_tecnico.dbo.lamiere_r ON db_tecnico.dbo.pannelli.id_lamiera_r = db_tecnico.dbo.lamiere_r.id_lamiera_r
            GROUP BY dbo.pannelli_linea.id_incollaggio, db_tecnico.dbo.pannelli.id_pannello, db_tecnico.dbo.pannelli.codice_pannello, db_tecnico.dbo.pannelli.descrizione, db_tecnico.dbo.pannelli.profilo, 
                dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta, db_tecnico.dbo.lamiere.lung1, db_tecnico.dbo.lamiere.lung2, db_tecnico.dbo.lamiere.halt, dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina, 
                dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione, dw_produzione.dbo.ordini_di_produzione.nome, db_tecnico.dbo.lamiere.ang, dw_produzione.dbo.filtro_pannelli.configurazione, dbo.pannelli_linea.faccia, 
                db_tecnico.dbo.lamiere.tipo, db_tecnico.dbo.lamiere_r.lung1, db_tecnico.dbo.lamiere_r.lung2, db_tecnico.dbo.lamiere_r.halt";
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $pannello["id_incollaggio"]=$row2['id_incollaggio'];
            $pannello["id_distinta"]=$row2['id_distinta'];
            $pannello["id_pannello"]=$row2['id_pannello'];
            $pannello["codice_pannello"]=utf8_encode($row2['codice_pannello']);
            $pannello["id_ordine_di_produzione"]=$row2['id_ordine_di_produzione'];
            $pannello["nome_ordine_di_produzione"]=utf8_encode($row2['nome_ordine_di_produzione']);
            $pannello["numero_cabina"]=utf8_encode($row2['numero_cabina']);
            $pannello["profilo"]=$row2['profilo'];
            $pannello["lung1"]=$row2['lung1'];
            $pannello["lung2"]=$row2['lung2'];
            $pannello["halt"]=$row2['halt'];
            $pannello["lung1_r"]=$row2['lung1_r'];
            $pannello["lung2_r"]=$row2['lung2_r'];
            $pannello["halt_r"]=$row2['halt_r'];
            $pannello["ang"]=$row2['ang'];
            $pannello["faccia"]=$row2['faccia'];
            $pannello["configurazione"]=strtoupper($row2['configurazione']);
            $pannello["tipo"]=$row2['tipo'];

            $id_pannello=$row2['id_pannello'];

            $rinforzi=[];
            $query="SELECT db_tecnico.dbo.rinforzi.id_rinforzo, db_tecnico.dbo.rinforzi.codice_rinforzo, db_tecnico.dbo.rinforzi.descrizione AS descrizione_rinforzo, db_tecnico.dbo.rinforzi_pannelli.posx, db_tecnico.dbo.rinforzi_pannelli.posy, 
                                db_tecnico.dbo.materie_prime.id_materia_prima, db_tecnico.dbo.materie_prime.codice_materia_prima, db_tecnico.dbo.materie_prime.descrizione AS descrizione_materiale, db_tecnico.dbo.rinforzi.qnt AS lunghezza, 
                                db_tecnico.dbo.rinforzi.vh,db_tecnico.dbo.rinforzi.hrin
                    FROM db_tecnico.dbo.rinforzi INNER JOIN
                                db_tecnico.dbo.rinforzi_pannelli ON db_tecnico.dbo.rinforzi.id_rinforzo = db_tecnico.dbo.rinforzi_pannelli.id_rinforzo INNER JOIN
                                db_tecnico.dbo.materie_prime ON db_tecnico.dbo.rinforzi.id_materia_prima = db_tecnico.dbo.materie_prime.id_materia_prima
                    WHERE (db_tecnico.dbo.rinforzi_pannelli.id_pannello = $id_pannello)";
            $result=sqlsrv_query($conn,$query);
            if($result==TRUE)
            {
                while($row=sqlsrv_fetch_array($result))
                {
                    $rinforzo["id_rinforzo"]=$row['id_rinforzo'];
                    $rinforzo["codice_rinforzo"]=utf8_encode($row['codice_rinforzo']);
                    $rinforzo["descrizione_rinforzo"]=utf8_encode($row['descrizione_rinforzo']);
                    $rinforzo["posx"]=$row['posx'];
                    $rinforzo["posy"]=$row['posy'];
                    $rinforzo["id_materia_prima"]=$row['id_materia_prima'];
                    $rinforzo["codice_materia_prima"]=utf8_encode($row['codice_materia_prima']);
                    $rinforzo["descrizione_materiale"]=utf8_encode($row['descrizione_materiale']);
                    $rinforzo["lunghezza"]=$row['lunghezza'];
                    $rinforzo["vh"]=$row['vh'];
                    $rinforzo["hrin"]=$row['hrin'];

                    array_push($rinforzi,$rinforzo);
                }
                $pannello["rinforzi"]=$rinforzi;
            }
            else
                die("error2".$query);

            $lane=[];
            $query3="SELECT db_tecnico.dbo.lane_pannelli.posx, db_tecnico.dbo.lane_pannelli.posy, db_tecnico.dbo.lane.lung, db_tecnico.dbo.lane.halt, db_tecnico.dbo.lane.spess, db_tecnico.dbo.materie_prime.id_materia_prima, 
                                db_tecnico.dbo.materie_prime.codice_materia_prima, db_tecnico.dbo.materie_prime.descrizione, db_tecnico.dbo.lane.id_lana, db_tecnico.dbo.lane.codice_lana, db_tecnico.dbo.lane.descrizione AS descrizione_lana
                    FROM db_tecnico.dbo.lane_pannelli INNER JOIN
                                db_tecnico.dbo.lane ON db_tecnico.dbo.lane_pannelli.id_lana = db_tecnico.dbo.lane.id_lana INNER JOIN
                                db_tecnico.dbo.materie_prime ON db_tecnico.dbo.lane.id_materia_prima = db_tecnico.dbo.materie_prime.id_materia_prima
                    WHERE (db_tecnico.dbo.lane_pannelli.id_pannello = $id_pannello)
                    ORDER BY db_tecnico.dbo.lane_pannelli.posx DESC";
            $result3=sqlsrv_query($conn,$query3);
            if($result3==TRUE)
            {
                while($row3=sqlsrv_fetch_array($result3))
                {
                    $lana["id_lana"]=$row3['id_lana'];
                    $lana["codice_lana"]=utf8_encode($row3['codice_lana']);
                    $lana["descrizione_lana"]=utf8_encode($row3['descrizione_lana']);
                    $lana["posx"]=$row3['posx'];
                    $lana["posy"]=$row3['posy'];
                    $lana["id_materia_prima"]=$row3['id_materia_prima'];
                    $lana["codice_materia_prima"]=utf8_encode($row3['codice_materia_prima']);
                    $lana["descrizione_materiale"]=utf8_encode($row3['descrizione']);
                    $lana["lung"]=$row3['lung'];
                    $lana["halt"]=$row3['halt'];
                    $lana["spess"]=$row3['spess'];

                    array_push($lane,$lana);
                }
                $pannello["lane"]=$lane;
            }
            else
                die("error2".$query);
        }
    }
    else
        die("error1".$query2);

    echo json_encode($pannello);

?>