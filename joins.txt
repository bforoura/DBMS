-- Forouraghi
-- CSC 621: DBMS


-- This example demonstrates:

   -- the UNIQUE constraint (unlike PRIMARY KEY, it allows NULL values)
   
   -- various types of combination operators in SQL:
      -- cross product
      -- natural join
      -- inner join
      -- outer joins (left, right, full)






-- **************************************************************
-- Create the following relations with their respective data
-- **************************************************************

create table suppliers
(
    supplier_id      varchar(40),
    supplier_name    varchar(40),
    unique(supplier_id)
);


insert into suppliers values('100','ACME');
insert into suppliers values('200','AJAX');
insert into suppliers values(null ,'STINKY');


	supplier_id	supplier_name
	=============================
	100		ACME 
	200		AJAX
	-		STINKY









create table supplies
(
    item_name    varchar(40),
    supplier_id  varchar(40),
    foreign key(supplier_id) references suppliers(supplier_id)
);



insert into supplies values('Brie','100');
insert into supplies values('Perrier','100');
insert into supplies values('Brie','200');
insert into supplies values('Limburger',NULL);
insert into supplies values('Tilsit',NULL);


	item_name	supplier_id
	===========================
	Brie		100
	Perrier		100
	Brie		200
	Limburger 	-
	Tilsit		-







-- **************************************************************
-- Two ways to form the cross product of the two relations
-- **************************************************************

select * 
from suppliers, supplies



select * 
from suppliers CROSS JOIN supplies

	SUPPLIER_ID	SUPPLIER_NAME	ITEM_NAME	SUPPLIER_ID
	===========================================================
	100		ACME		Brie		200
	100		ACME		Limburger	-
	100		ACME		Tilsit		-
	100		ACME		Brie		100
	100		ACME		Perrier		100
	- 		STINKY		Brie		200
	- 		STINKY		Limburger	-
	- 		STINKY		Tilsit		-
	- 		STINKY		Brie		100
	- 		STINKY		Perrier		100
	200		AJAX		Brie		200
	200		AJAX		Limburger	-
	200		AJAX		Tilsit		-
	200		AJAX		Brie		100
	200		AJAX		Perrier		100





-- *********************************************************************
-- Four ways to list suppliers of Brie using NATURAL JOIN and INNER JOIN
-- *********************************************************************


select supplier_name
from   suppliers NATURAL JOIN supplies 
where  item_name = 'Brie'

select supplier_name
from   suppliers NATURAL INNER JOIN supplies
where  item_name = 'Brie'

select supplier_name
from   suppliers INNER JOIN supplies ON suppliers.supplier_id=supplies.supplier_id
where  item_name = 'Brie'

select supplier_name
from   suppliers INNER JOIN supplies USING(supplier_id)
where  item_name = 'Brie'


	SUPPLIER_NAME
	=============
	AJAX
	ACME








-- ***************************************************************
-- Which company offers the largest number of items.
-- ***************************************************************

select   supplier_name, count(*)
from     suppliers NATURAL JOIN supplies
group by supplier_name
having   count(*) >= all
                        (
                         select   count(*)
                         from     suppliers NATURAL JOIN supplies
                         group by supplier_name
                        )


	SUPPLIER_NAME	COUNT(*)
	========================
	ACME		2





















-- **************************************************************
-- List the discontinued items with LEFT [OUTER] JOIN
-- **************************************************************

select item_name
from   supplies NATURAL JOIN suppliers 

	ITEM_NAME
	=========
	Brie
	Brie
	Perrier


select item_name
from   supplies LEFT JOIN suppliers USING (supplier_id)

	ITEM_NAME
	=========
	Brie
	Limburger
	Tilsit
	Brie
	Perrier


select item_name
from   supplies LEFT JOIN suppliers USING (supplier_id)
where  supplier_id is null

	ITEM_NAME
	=========
	Limburger
	Tilsit









-- **************************************************************
-- List the discontinued suppliers with RIGHT [OUTER] JOIN
-- **************************************************************

select supplier_name
from   supplies JOIN suppliers USING (supplier_id)

	SUPPLIER_NAME
	=============
	AJAX
	ACME
	ACME


select supplier_name
from   supplies RIGHT JOIN suppliers USING (supplier_id)

	SUPPLIER_NAME
	=============
	AJAX
	ACME
	ACME
	STINKY


select supplier_name
from   supplies RIGHT JOIN suppliers USING (supplier_id)
where  supplier_id is null

	SUPPLIER_NAME
	=============
	STINKY









-- *****************************************************************
-- List the discontinued suppliers and items with FULL  [OUTER] JOIN
-- *****************************************************************

select item_name, supplier_name
from   supplies  JOIN suppliers USING (supplier_id))

	ITEM_NAME	SUPPLIER_NAME
	=============================
	Brie		AJAX
	Brie		ACME
	Perrier		ACME


select item_name, supplier_name
from   supplies FULL JOIN suppliers USING (supplier_id)

	ITEM_NAME	SUPPLIER_NAME
	=============================
	Brie		AJAX
	Limburger	-
	Tilsit		-
	Brie		ACME
	Perrier		ACME
	- 		STINKY


select item_name, supplier_name
from   supplies FULL JOIN suppliers USING (supplier_id)
where  supplier_id is null

	ITEM_NAME	SUPPLIER_NAME
	=============================
	Limburger	-
	Tilsit		-
	- 		STINKY






-- **************************************************************
-- Find items supplied by ACME
-- **************************************************************

select item_name
from   supplies NATURAL JOIN suppliers
where  supplier_name = 'ACME'


select item_name
from   supplies s
where  s.supplier_id = all
                     (select supplier_id
                      from   suppliers
                      where  supplier_name = 'ACME');

	ITEM_NAME
	=========
	Brie
	Perrier






-- **************************************************************
-- More on Left, right and full [outer] join  vs.  natural join
-- **************************************************************

 
 select * from r				
 
 A	B	C
 =================
 a1	b1	c1
 a3	b3	c3
 a2	b2	c2
 
 
 
 
 
select * from s
 
B	C	D
=================
b4	c4	d4
b1	c1	d1
b2	c2	d2









select A, B, C, D 
from   r natural join s

A	B	C	D
==========================
a1	b1	c1	d1
a2	b2	c2	d2







select A, B, C, D 
from   r left join s using (B,C)

A	B	C	D
==========================
a1	b1	c1	d1
a2	b2	c2	d2

a3	b3	c3	 -






select A, B, C, D 
from   r right join s using (B,C)

A	B	C	D
==========================
a1	b1	c1	d1
a2	b2	c2	d2

-	b4	c4	d4







select A, B, C, D 
from   r full join s using (B,C)

A	B	C	D
==========================
a1	b1	c1	d1
a2	b2	c2	d2

a3	b3	c3	 -         <=== from left

-	b4	c4	d4         <=== from right
