/*
   Query 1: List of all documents
   ======================================
	In MongoDB, the {} object in a find() query is the query filter.
	An empty object ({}) means that no filters are applied, so all
	documents match the query. This is why both find() and find({})
	return all documents.

	SQL: SELECT *
	     FROM amazon
*/

db.amazon.find({})



/*
   Query 2: List count of all documents
   ======================================

   SQL: SELECT COUNT(*)
        FROM amazon;
*/

db.amazon.countDocuments({})

/* 
   Note that we cannot type the above command in the Query Bar. Instead,
   we can use the $count operator which is a built-in function in MongoDB's 
   Aggregation Framework.
/*

   db.amazon.aggregate([
       {"$count": "total_documents"}
    ])

	

   Query 3: Count of all manufacturers
   =======================================

   {} (First argument: Query filter):

   The first argument is an empty object {}, which is the query filter.
   This means no filtering is applied — in other words, it will match
   all documents in the amazon collection. So, the query will return
   all documents in the collection.

   { manufacturer: 1, _id: 0 } (Second argument: Projection):

   The second argument specifies which fields to include or exclude
   in the returned documents.

   manufacturer: 1: This means include the manufacturer field in the result.
  _id: 0: This means exclude the _id field from the result
  (by default, MongoDB includes the _id field unless explicitly excluded).


  SQL: SELECT manufacturer
       FROM amazon;
*/

db.amazon.find({}, { manufacturer: 1, _id: 0 })

db.amazon.aggregate([
  {
    "$project": {
      "manufacturer": 1,
      "_id": 0
    }
  }
])





/*
   Query 4: List all unique manufacturers
   ======================================
   The  _id field is a special field that represents the unique identifier for each document.
   When performing aggregation operations like $group, MongoDB uses the _id field to group documents.

   SQL: SELECT manufacturer
        FROM amazon
        GROUP BY manufacturer;

   MQL: db.amazon.distinct("manufacturer")
*/

db.amazon.aggregate([
  {
    $group: {
      _id: "$manufacturer"  // Group by manufacturer to get unique values
    }
  }
])


/*
   Query 5a: List no. of all unique manufacturers
   =============================================
	$group: Groups the documents by the manufacturer field.
	Each group represents a distinct manufacturer, and MongoDB
	will create one output document per unique manufacturer.

	$count: After grouping, we use the $count stage to count how
	many distinct manufacturers there are. The result will be a
	document with a field unique_manufacturer_count that contains
	the total number of distinct manufacturers.

	SQL: SELECT COUNT(DISTINCT manufacturer) AS unique_manufacturer_count
	     FROM amazon;
	     -- or -- 
	     SELECT manufacturer, COUNT(*) AS manufacturer_count
		 FROM amazon
	  	 GROUP BY manufacturer;
		 
	MQL: db.amazon.distinct("manufacturer").length
*/


/* In the aggregate shown below, assume the original collection is like this:
	_id		Manufacturer
	====================
	1		Hornby
	2		Hornby
	3		Bachmann
	4		Peco
	5		Bachmann

After the $group stage:

Input Documents		Output Documents (Unique List)
==================================================
"Hornby (1, 2)" 	{ "_id": "Hornby" }
"Bachmann (3, 5)"	{ "_id": "Bachmann"}
"Peco (4)"			{ "_id": "Peco"}


After the $count stage:

Input Documents		Output Document
==================================================
{"_id": "Hornby"}
{"_id": "Bachmann"}			3
{"_id": "Peco"}

*/

db.amazon.aggregate([
  {
    $group: {
      _id: "$manufacturer"  // Group by manufacturer to get unique manufacturers
    }
  },
  {
    $count: "unique_manufacturer_count"  // Count the number of groups (distinct manufacturers)
  }
])




/* In the aggregate shown below, assume the original collection is like this:
	_id		Manufacturer
	====================
	1		Hornby
	2		Hornby
	3		Bachmann
	4		Peco
	5		Bachmann

After the 1st $group stage:

Input Documents		Output Documents (Unique List)
==================================================
"Hornby (1, 2)" 	{ "_id": "Hornby" }
"Bachmann (3, 5)"	{ "_id": "Bachmann"}
"Peco (4)"			{ "_id": "Peco"}


After the 2nd $group stage:

Input Documents		Output Document
==================================================
_id					unique_manufacturer_count
null				3

*/


db.amazon.aggregate([
  {
    $group: {
      _id: "$manufacturer" // Create a document for each unique manufacturer
    }
  },
  {
    $group: {
      _id: null, // When we set the _id field to null in a $group stage, MongoDB puts all documents in one group.
      unique_manufacturer_count: { $sum: 1 } // Sums 1 for each document in the group
    }
  }
])


/* 
   Note: Both queries in above produce the identical result, but Query 1 using the $count stage is the preferred, 
   more efficient, less verbose.
*/




/* 
   Query 5b: Find average price for each manufacturer 
   
   ===================================================
*/

db.amazon.aggregate([
  {
    $group: {
      _id: "$manufacturer",
      average_price: { $avg: "$price" }  
    }
  }
])



/*
   Query 6: List of manufacturers and their product prices
   =======================================================

   SQL: SELECT manufacturer, price
        FROM amazon;
*/

db.amazon.find({}, { manufacturer: 1, price: 1, _id: 0 })




/*
   Query 7: Return a list of distinct manufacturers that have more than 10 reviews.
   ================================================================================

   $match: Filters documents where number_of_reviews is greater than 10.

   $group: Groups the results by manufacturer, ensuring only unique manufacturers are returned.

   SQL: SELECT DISTINCT manufacturer
		FROM amazon
		WHERE number_of_reviews > 10;
*/

db.amazon.aggregate([
  {
    $match: { number_of_reviews: { $gt: 10 } }  // Filter documents where number_of_reviews > 10
  },
  {
    $group: { _id: "$manufacturer" }  // Group by manufacturer to get unique manufacturers
  }
])





/*
   Query 8: Return a list of distinct manufacturers that have between 10 and 20 reviews.
   ====================================================================================

   	$match: Filters documents where number_of_reviews is greater than 10.
   	$gte: 10: Selects documents where number_of_reviews is greater than or equal to 10.
	$lte: 20: Selects documents where number_of_reviews is less than or equal to 20.

   	$group: Groups the results by manufacturer, ensuring only unique manufacturers are returned.

	SELECT DISTINCT manufacturer
	FROM amazon
	WHERE number_of_reviews BETWEEN 10 AND 20;
*/


db.amazon.aggregate([
  {
    $match: {
      number_of_reviews: { $gte: 10, $lte: 20 }  // Filter documents where number_of_reviews is between 10 and 20
    }
  },
  {
    $group: { _id: "$manufacturer" }  // Group by manufacturer to get unique manufacturers
  }
])



/*
   Query 9: Calculate the average no. of reviews for all manufacturers.
   =================================================================================================

	_id: null ==> This groups all documents together into one group, allowing us to calculate a global
	average across the entire collection.

	The average_reviews field will contain the calculated average of the number_of_reviews across all documents.

	If there are any missing or invalid values in the number_of_reviews field (e.g., null, NaN, etc.),
	you can use the $ifNull or $cond operators to handle them and ensure they don't affect the average calculation.

   SQL: SELECT AVG(number_of_reviews) AS average_reviews
		FROM amazon
		WHERE number_of_reviews IS NOT NULL;
*/


/* For example:

Document ID (_id)	number_of_reviews
======================================
		1			15
		2			null
		3			10
		4			25
		5			null

Document ID		number_of_reviews		value Passed to $avg
============================================================
		1			15							15
		2			null						0
		3			10							10
		4			25							25
		5			null						0


Document ID			$avg
=========================
	null			50/5

*/


db.amazon.aggregate([
  {
    $project: {
      number_of_reviews: { $ifNull: ["$number_of_reviews", 0] }  // Replace null with 0
    }
  },
  {
    $group: {
      _id: null,
		
      average_reviews: { $avg: "$number_of_reviews" }
    }
  }
])

/* or */

db.amazon.aggregate([
  {
    $group: {
      _id: null,
		
      // Apply $ifNull directly to the field *before* $avg calculates the average
      average_reviews: { $avg: { $ifNull: ["$number_of_reviews", 0] } } 
    }
  }
])



/*
   Query 10: List all products containing the word 'christmas'
   =================================================================================================
	product_name: { $regex: "christmas", $options: "i" }: This part of the query uses the $regex operator
	to find documents where the product_name contains the word "christmas".

	The $options: "i" makes the search case-insensitive, so it will match "Christmas", "christmas", "CHRISTMAS", etc.

	{ product_name: 1, _id: 0 }: This projection part returns only the product_name field and excludes the _id field.


	SQL: SELECT product_name
		FROM amazon
		WHERE product_name ILIKE '%christmas%';

    ILIKE performs the same operation as LIKE, but it's case-insensitive

*/  


db.amazon.find(
  { product_name: { $regex: "christmas", $options: "i" } },  // Search for "christmas" in product_name, case-insensitive
  { product_name: 1, _id: 0 }  // Projection: only return product_name, exclude _id

)

/* Alternate query:  */


db.amazon.aggregate([
  {
    // 1. $match: Filters documents based on the specified criteria
    $match: {
      product_name: { 
        $regex: "christmas", 
        $options: "i" // 'i' flag makes the search case-insensitive
      }
    }
  },
  {
    // 2. $project: Reshapes each document, including only the specified fields
    $project: {
      product_name: 1, // Include the product_name field
      _id: 0           // Exclude the default _id field
    }
  }
])


/*
 Example:

   Original _id		product_name					price (Other Fields)
   =========================================================
	1				Hornby 2014 Catalogue			£3.42
	2				Christmas Lights Set			£12.99
	3				Train Set, Christmas Special	£50.00
	4				Toy Car Collection				£8.00
	5				Train Track cHrIStMaS Edition	£15.00


After $match

Input Documents				Filtering Action
============================================
	1						EXCLUDED (No "christmas")
	2						INCLUDED (Matches "Christmas Lights Set")
	3						INCLUDED (Matches "Train Set, Christmas Special")
	4						EXCLUDED (No ""christmas"")
	5						INCLUDED (Matches "Train Track cHrIStMaS Edition")

So, 3 documents are passed to the $project stage, containing all their original fields.

*/





