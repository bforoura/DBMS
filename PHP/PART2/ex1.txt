<!-- ***************
     **** Example 1
******************** -->
<h3> Results</h3>


<?php

        # ***************
        # **** Example 1
        # ***************

    $grades = array(100, 55, 70, 90, 75, 42);

    //*** sort grades in desc order
    //*** options are asort() and rsort()
    $sorted_grades = rsort($grades);

    foreach ($grades as $grade) {
		if ($grade >= 95)
			echo "Passed: Grade A <br/>";

		elseif ($grade >= 85)
			echo "Passed: Grade B <br/>";

		elseif ($grade >= 75)
			echo "Passed: Grade C <br/>";

		elseif ($grade >= 65)
			echo "Passed: Grade D <br/>";

		else
			echo "Failed <br/>";
    }


?>