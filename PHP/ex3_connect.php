<?php

    //*** connect to mysql on maxwell


    $dbhost = 'localhost';

    $dbuser  = $_POST["uname"];
    $dbpass  = $_POST["passwd"];
    $dbquery = $_POST["query"];


    //*** create a connection object
    $conn = mysql_connect($dbhost, $dbuser, $dbpass)
            or die (mysql_error());


    $dbname =  $_POST["db"];
    mysql_select_db($dbname)
            or die (mysql_error());


    //*** execute the query
    $result = mysql_query("select * from music");


    //*** die if no result
    if (!$result)
         die("Query Failed.");



    //*** get column heading first
    print("<table border=0 width=400 align=center>");
    print("<tr>");
    for($i = 0; $i < mysql_num_fields($result); $i++)
        printf("<th  bgcolor=orange> %s </th>", strtoupper(mysql_field_name($result, $i)));
    print("</tr>");



    //*** now print table data
    while($row = mysql_fetch_row($result)){
    print("<tr>");
       foreach ($row as $item)
           printf("<td align=center> %s </td>", $item);
    print("</tr>");
    }
    print("</table>");



    //*** Free the resources associated with the result
    mysql_free_result($result);

    //*** close this connection
    mysql_close($conn);
?>