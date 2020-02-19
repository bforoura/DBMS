<html>
  <head>
    <title> Process the  form </title>
  </head>
  <body>
    <?php

// Get form data values

      $unpop = $_POST["unpop"];
      $caramel = $_POST["caramel"];
      $caramelnut = $_POST["caramelnut"];
      $toffeynut = $_POST["toffeynut"];
      $name = $_POST["name"];
      $street = $_POST["street"];
      $city = $_POST["city"];
      $payment = $_POST["payment"];

// If any of the quantities are blank, set them to zero

      if ($unpop == "") $unpop = 0;
      if ($caramel == "") $caramel = 0;
      if ($caramelnut == "") $caramelnut = 0;
      if ($toffeynut == "") $toffeynut = 0;

// Compute the item costs and total cost

      $unpop_cost = 3.0 * $unpop;
      $caramel_cost = 3.5 * $caramel;
      $caramelnut_cost = 4.5 * $caramelnut;
      $toffeynut_cost = 5.0 * $toffeynut;
      $total_price = $unpop_cost + $caramel_cost +
                     $caramelnut_cost + $toffeynut_cost;
      $total_items = $unpop + $caramel + $caramelnut + $toffeynut;

// Return the results to the browser in a table

    ?>
    <h4> Customer: </h4>
    <?php
      print ("$name <br /> $street <br /> $city <br />");
    ?>
    <p /> <p />

    <table border = "border">
      <caption> Order Information </caption>
      <tr>
        <th> Product </th>
        <th> Unit Price </th>
        <th> Quantity Ordered </th>
        <th> Item Cost </th>
      </tr>
      <tr align = "center">
        <td> Unpopped Popcorn </td>
        <td> $3.00 </td>
        <td> <?php print ("$unpop"); ?> </td>
        <td> <?php printf ("$ %4.2f", $unpop_cost); ?>
        </td>
      </tr>
      <tr align = "center">
        <td> Caramel Popcorn </td>
        <td> $3.50 </td>
        <td> <?php print ("$caramel"); ?> </td>
        <td> <?php printf ("$ %4.2f", $caramel_cost); ?>
        </td>
        </tr>
      <tr align = "center">
        <td> Caramel Nut Popcorn </td>
        <td> $4.50 </td>
        <td> <?php print ("$caramelnut"); ?> </td>
        <td> <?php printf ("$ %4.2f", $caramelnut_cost); ?>
        </td>
      </tr>
      <tr align = "center">
        <td> Toffey Nut Popcorn </td>
        <td> $5.00 </td>
        <td> <?php print ("$toffeynut"); ?> </td>
        <td> <?php printf ("$ %4.2f", $toffeynut_cost); ?>
        </td>
      </tr>
    </table>
    <p /> <p />

    <?php
      print ("You ordered $total_items popcorn items <br />");
      printf ("Your total bill is: $ %5.2f <br />", $total_price);
      print ("Your chosen method of payment is: $payment <br />");
    ?>



  </body>
</html>

