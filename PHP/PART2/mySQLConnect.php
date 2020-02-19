<?php
    //***********************************************************************************
    function executeQuery($query) {

              $dbhost = 'localhost';
              $dbuser = 'guest';
              $dbpass = 'guest';
              $dbname = 'guestdb';


		//*** create a connection object
		$conn = mysql_connect($dbhost, $dbuser, $dbpass)
				or die (mysql_error());


		mysql_select_db($dbname)
				or die (mysql_error());


		//*** execute the query
		$result = mysql_query($query);


		//*** die if no result
		if (!$result)
			 die("Query Failed.");



		//*** get column headings first
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

		}

?>
