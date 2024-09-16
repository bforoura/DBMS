-- The examples here demonstrate:

   -- format masks
   -- group by and having
   -- more on order by
   -- date data type
   -- aliasing columns
   -- like vs. = for string comparison
   -- more on subqueries
   -- to_char(), upper(), substr()
   -- exists





-- *************************************************************
-- Create the relation
-- *************************************************************

create table csc621
(
    id     number(3)    not null,
    major  varchar(4)   check (major in ('CSC', 'MAT', 'ASC')),
    gpa    number(3,2)  check (gpa between 0.00 and 4.00),
    constraint id_pk primary key(id)
);


-- populate the table with these tuples
select *  from csc621;

ID	MAJOR	GPA
===================
100	CSC	3.2
110	CSC	3.4
120	CSC	3.8
130	CSC	4
210	MAT	2.9
220	MAT	2
230	MAT	3
300	ASC	1
310	ASC	1.1





-- *************************************************************
-- What's the average GPA of all students enrolled in the class?
-- *************************************************************
	
select avg(gpa) "Class Average"
from csc621;

Class Average
=======================================
2.71111111111111111111111111111111111111



select to_char(avg(gpa), '99.99') "Class Average"
from csc621;

Class Average
=============
2.71




-- *************************************************************
-- What's the average GPA of each group of majors in the class?
-- *************************************************************

select major "Major", avg(gpa) "Major GPA"
from   csc621
group by (major);


MAJOR	AVG(GPA)
================
CSC	3.6
MAT	2.63
ASC	1.05





-- *************************************************************
-- Which major has the highest avg gpa?
-- *************************************************************


select major, avg(gpa)
from   csc621
group by (major)
having  avg(gpa) >= all
                  (select avg(gpa)
                   from   csc621
                   group by (major))

MAJOR	AVG(GPA)
================
CSC	3.6





-- *************************************************************
-- Find CSC majors with GPA above average?
-- *************************************************************


select id, gpa
from   csc621
where  major='CSC' and gpa >  
                           (select avg(gpa)
                            from   csc621
                            where  major='CSC'
                            group by (major)
                            )
order by id, gpa;



ID	GPA
===========
120	3.8
130	4










-- *************************************************************
-- Create a new relation sales_data
-- *************************************************************

select * from sales_data;

NAME	SOLD	T_DATE
=========================
Keith	20	24-AUG-23
Keith	40	15-SEP-23
Keith	10	12-DEC-24
Mallory	100	12-AUG-23
Mallory	30	12-SEP-23
Jason	300	12-AUG-24
Jason	3000	11-OCT-23
Jon	2	12-AUG-23
Jon	200	12-AUG-24
Scott	30	24-AUG-23
Scott	60	19-SEP-23
Scott	90	20-DEC-24
Jesse	120	12-AUG-23
Jesse	70	12-AUG-24
Jeff	25	10-FEB-23
Jeff	85	22-JUN-24









-- *************************************************************
-- Display 2023 sales data
-- *************************************************************

select *
from   sales_data
where  t_date like '%23%';

NAME	SOLD	T_DATE
=========================
Keith	20	24-AUG-23
Keith	40	15-SEP-23
Mallory	100	12-AUG-23
Mallory	30	12-SEP-23
Jason	3000	11-OCT-23
Jon	2	12-AUG-23
Scott	30	24-AUG-23
Scott	60	19-SEP-23
Jesse	120	12-AUG-23
Jeff	25	10-FEB-23





-- *************************************************************
-- What was the total sales in 2023?
-- *************************************************************

select sum(sold)
from   sales_data
where  t_date like '%23%';

SUM(SOLD)
=========
3427




select sum(sold)
from   sales_data
where  to_char(t_date,'YYYY') = 2023;

SUM(SOLD)
=========
3427







-- *************************************************************
-- What were the total sales in different months in 2023?
-- *************************************************************

select to_char(t_date,'MON') as Month, sum(sold) as "Total Sales"
from   sales_data
where  to_char(t_date,'YYYY') = 2023
group  by to_char(t_date,'MON')
order  by "Total Sales"

MONTH	Total Sales
===================
FEB	25
SEP	130
AUG	272
OCT	3000





-- *************************************************************
-- What were the total sales in 2023 and 2024?
-- *************************************************************

select to_char(t_date,'YYYY'), sum(sold)
from   sales_data
group  by to_char(t_date,'YYYY');


TO_CHAR(T_DATE,'YYYY')	SUM(SOLD)
=================================
2024			755
2023			3427









-- *************************************************************
-- Group sales data by year and month
-- *************************************************************

select   to_char(t_date,'YYYY') "Year" , to_char(t_date,'MON') "Month", sum(sold) "Total"
from     sales_data
group by to_char(t_date,'YYYY'), to_char(t_date,'MON')
order by "Year", 

Year	Month	Total
=====================
2023	AUG	272
2023	FEB	25
2023	OCT	3000
2023	SEP	130
2024	AUG	570
2024	DEC	100
2024	JUN	85









-- *************************************************************
-- More on formats
-- *************************************************************

select  t_date
from    sales_data;

T_DATE
=========
24-AUG-23
15-SEP-23
12-DEC-24
12-AUG-23
12-SEP-23
12-AUG-24
11-OCT-23
12-AUG-23
12-AUG-24
24-AUG-23
19-SEP-23
20-DEC-24
12-AUG-23
12-AUG-24
10-FEB-23
22-JUN-24



select    to_date(t_date,'MM/DD/YYYY')
from      sales_data;

ORA-01843: not a valid month





select    to_date(t_date,'DD-MON-YY')
from      sales_data;

TO_DATE(T_DATE,'DD-MON-YY')
===========================
24-AUG-23
15-SEP-23
12-DEC-24
12-AUG-23
12-SEP-23
12-AUG-24
11-OCT-23
12-AUG-23
12-AUG-24
24-AUG-23
19-SEP-23
20-DEC-24
12-AUG-23
12-AUG-24
10-FEB-23
22-JUN-24







-- *************************************************************
-- to_char( ) , substr( ) and string concatenation
-- *************************************************************

select    substr(to_char(t_date,'DD-MM-YY'), 7, 2) AS yr
from      sales_data
order by  yr;

YR
==
23
23
23
23
23
23
23
23
23
24
24
24
24
24
24




select    to_char(t_date,'YYYY') AS yr
from      sales_data
order by  yr;

YR
====
2023
2023
2023
2023
2023
2023
2023
2023
2023
2023
2024
2024
2024
2024
2024
2024









select    substr(to_char(t_date,'DD-MM-YY'), 7, 2) as year
from      sales_data
group by  substr(to_char(t_date,'DD-MM-YY'), 7, 2)

YEAR
====
24
23






select    20 || substr(to_char(t_date,'DD-MM-YY'), 7, 2) as year
from      sales_data
group by  substr(to_char(t_date,'DD-MM-YY'), 7, 2)

YEAR
====
2024
2023






select    name,  20 || substr(to_char(t_date,'DD-MM-YY'), 7, 2) as year, sum(sold) "Total Sold"
from      sales_data
group by  name, substr(to_char(t_date,'DD-MM-YY'), 7, 2)

NAME	YEAR	Total Sold
==========================
Jason	2024	300
Scott	2023	90
Keith	2023	60
Jon	2023	2
Jon	2024	200
Jesse	2023	120
Jesse	2024	70
Keith	2024	10
Jason	2023	3000
Scott	2024	90
Mallory	2023	130
Jeff	2023	25
Jeff	2024	85






select    name,  sum(sold) "Total Sold"
from      sales_data
group by  name

NAME	Total Sold
==================
Jon	202
Scott	180
Jesse	190
Keith	70
Mallory	130
Jason	3300
Jeff	110








-- **********************************************************
-- Can alias a column and use it in order by but not group by
-- **********************************************************

select    name,  sum(sold) as "Total Sold" 
from      sales_data
group by  name
order by  "Total Sold" 

NAME	Total Sold
==================
Keith	70
Jeff	110
Mallory	130
Scott	180
Jesse	190
Jon	202
Jason	3300






-- **********************************************************
-- Who sold the most over the years?
-- **********************************************************


select    name,  sum(sold) "Total Sold"
from      sales_data
group by  name
having    sum(sold)  >= all 
                            (select  sum(sold) 
                             from      sales_data
                             group by  name)


NAME	Total Sold
==================
Jason	3300






-- **********************************************************
-- Who sold the least in 2023?
-- **********************************************************


select    name,  sum(sold) "Total Sold"
from      sales_data
where     substr(to_char(t_date,'DD-MM-YY'), 7, 2) = '13'
group by  name
having    sum(sold)  <= all 
                            (select    sum(sold) 
                             from      sales_data
                             where     substr(to_char(t_date,'DD-MM-YY'), 7, 2) = '23'
                             group by  name)



NAME	Total Sold
==================
Jon	2








-- **********************************************************
-- Who sold the least in 2024?
-- **********************************************************


select    name,  sum(sold) "Total Sold"
from      sales_data
where     20 || substr(to_char(t_date,'DD-MM-YY'), 7, 2) like '%24'
group by  name
having    sum(sold)  <= all 
                            (select    sum(sold) 
                             from      sales_data
                             where     substr(to_char(t_date,'DD-MM-YY'), 7, 2) = '24'
                             group by  name)
order by  name;


NAME	Total Sold
==================
Keith	10







select    name,  sum(sold) "Total Sold"
from      sales_data
where     to_char(t_date,'YY') like '%24'
group by  name
having    sum(sold)  <= all 
                            (select    sum(sold) 
                             from      sales_data
                             where     to_char(t_date,'YYYY') = 2024
                             group by  name)
order by  name;



NAME	Total Sold
==================
Keith	10











-- ************************************************************
-- use exists to find out if there were any sales in JAN or DEC
-- ************************************************************

select count(distinct sysdate) as "1/Yes 0/No"
from   sales_data
where  exists 
              (select *
               from   sales_data
               where  to_char(t_date,'MON') in ('JAN', 'DEC'))


1/Yes 0/No
==========
1





select count(distinct sysdate) as "1/Yes 0/No"
from   sales_data
where  exists 
              (select *
               from   sales_data
               where  to_char(t_date,'MON') in ('JAN', 'APR'))


1/Yes 0/No
==========
0





