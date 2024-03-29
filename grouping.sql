-- Forouraghi
-- DBMS 

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


Save this file and load it into csc621 as tab delimited data under 

    SQL>Utilities>Load>Load Text>Existing Table

100	CSC	3.2
110	CSC	3.4
120	CSC	3.8
130	CSC	4.0
210	MAT	2.9
220	MAT	2.0
230	MAT	3.0
300	ASC	1.0
310	ASC	1.1



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




save the following  in 'queries.sql':

-- --------------------------------------------------------------------------------
create table sales_data
(
    name    varchar(10)   not null,
    sold    number(4)     check (sold between 0 and 9999),
    t_date  date          -- transaction date
);

insert into sales_data values('Keith',   20,  to_date('08/24/2014', 'MM/DD/YYYY'));
insert into sales_data values('Keith',   40,  to_date('09/15/2014', 'MM/DD/YYYY'));
insert into sales_data values('Keith',   10,  to_date('12/12/2013', 'MM/DD/YYYY'));
insert into sales_data values('Mallory', 100, to_date('08/12/2014', 'MM/DD/YYYY'));
insert into sales_data values('Mallory', 30,  to_date('09/12/2014', 'MM/DD/YYYY'));
insert into sales_data values('Jason',   300, to_date('08/12/2013', 'MM/DD/YYYY'));
insert into sales_data values('Jason',  3000, to_date('10/11/2014', 'MM/DD/YYYY'));
insert into sales_data values('Jon',       2, to_date('08/12/2014', 'MM/DD/YYYY'));
insert into sales_data values('Jon',     200, to_date('08/12/2013', 'MM/DD/YYYY'));
insert into sales_data values('Scott',   30,  to_date('08/24/2014', 'MM/DD/YYYY'));
insert into sales_data values('Scott',   60,  to_date('09/19/2014', 'MM/DD/YYYY'));
insert into sales_data values('Scott',   90,  to_date('12/20/2013', 'MM/DD/YYYY'));
insert into sales_data values('Jesse',   120, to_date('08/12/2014', 'MM/DD/YYYY'));
insert into sales_data values('Jesse',    70, to_date('08/12/2013', 'MM/DD/YYYY'));
insert into sales_data values('Jeff',     25, to_date('02/10/2014', 'MM/DD/YYYY'));
insert into sales_data values('Jeff',     85, to_date('06/22/2013', 'MM/DD/YYYY'));
-- --------------------------------------------------------------------------------

Follow instructions provided in class to upload and run the script 'queries.sql'




select * from sales_data;

NAME	SOLD	T_DATE
=========================
Keith	20	24-AUG-13
Keith	40	15-SEP-13
Keith	10	12-DEC-14
Mallory	100	12-AUG-13
Mallory	30	12-SEP-13
Jason	300	12-AUG-14
Jason	3000	11-OCT-13
Jon	2	12-AUG-13
Jon	200	12-AUG-14
Scott	30	24-AUG-13
Scott	60	19-SEP-13
Scott	90	20-DEC-14
Jesse	120	12-AUG-13
Jesse	70	12-AUG-14
Jeff	25	10-FEB-13
Jeff	85	22-JUN-14









-- *************************************************************
-- Display 2013 sales data
-- *************************************************************

select *
from   sales_data
where  t_date like '%13%';

NAME	SOLD	T_DATE
=========================
Keith	20	24-AUG-13
Keith	40	15-SEP-13
Mallory	100	12-AUG-13
Mallory	30	12-SEP-13
Jason	3000	11-OCT-13
Jon	2	12-AUG-13
Scott	30	24-AUG-13
Scott	60	19-SEP-13
Jesse	120	12-AUG-13
Jeff	25	10-FEB-13





-- *************************************************************
-- What was the total sales in 2013?
-- *************************************************************

select sum(sold)
from   sales_data
where  t_date like '%13%';

SUM(SOLD)
=========
3427




select sum(sold)
from   sales_data
where  to_char(t_date,'YYYY') = 2013;

SUM(SOLD)
=========
3427







-- *************************************************************
-- What were the total sales in different months in 2013?
-- *************************************************************

select to_char(t_date,'MON') as Month, sum(sold) as "Total Sales"
from   sales_data
where  to_char(t_date,'YYYY') = 2013
group  by to_char(t_date,'MON')
order  by "Total Sales"

MONTH	Total Sales
===================
FEB	25
SEP	130
AUG	272
OCT	3000





-- *************************************************************
-- What were the total sales in 2013 and 2014?
-- *************************************************************

select to_char(t_date,'YYYY'), sum(sold)
from   sales_data
group  by to_char(t_date,'YYYY');


TO_CHAR(T_DATE,'YYYY')	SUM(SOLD)
=================================
2014			755
2013			3427









-- *************************************************************
-- Group sales data by year and month
-- *************************************************************

select   to_char(t_date,'YYYY') "Year" , to_char(t_date,'MON') "Month", sum(sold) "Total"
from     sales_data
group by to_char(t_date,'YYYY'), to_char(t_date,'MON')
order by "Year", 

Year	Month	Total
=====================
2013	AUG	272
2013	FEB	25
2013	OCT	3000
2013	SEP	130
2014	AUG	570
2014	DEC	100
2014	JUN	85









-- *************************************************************
-- More on formats
-- *************************************************************

select  t_date
from    sales_data;

T_DATE
=========
24-AUG-13
15-SEP-13
12-DEC-14
12-AUG-13
12-SEP-13
12-AUG-14
11-OCT-13
12-AUG-13
12-AUG-14
24-AUG-13
19-SEP-13
20-DEC-14
12-AUG-13
12-AUG-14
10-FEB-13
22-JUN-14



select    to_date(t_date,'MM/DD/YYYY')
from      sales_data;

ORA-01843: not a valid month





select    to_date(t_date,'DD-MON-YY')
from      sales_data;

TO_DATE(T_DATE,'DD-MON-YY')
===========================
24-AUG-13
15-SEP-13
12-DEC-14
12-AUG-13
12-SEP-13
12-AUG-14
11-OCT-13
12-AUG-13
12-AUG-14
24-AUG-13
19-SEP-13
20-DEC-14
12-AUG-13
12-AUG-14
10-FEB-13
22-JUN-14







-- *************************************************************
-- to_char( ) , substr( ) and string concatenation
-- *************************************************************

select    substr(to_char(t_date,'DD-MM-YY'), 7, 2) AS yr
from      sales_data
order by  yr;

YR
==
13
13
13
13
13
13
13
07
13
13
14
14
14
14
14
14




select    to_char(t_date,'YYYY') AS yr
from      sales_data
order by  yr;

YR
====
2013
2013
2013
2013
2013
2013
2013
2013
2013
2013
2014
2014
2014
2014
2014
2014









select    substr(to_char(t_date,'DD-MM-YY'), 7, 2) as year
from      sales_data
group by  substr(to_char(t_date,'DD-MM-YY'), 7, 2)

YEAR
====
14
13






select    20 || substr(to_char(t_date,'DD-MM-YY'), 7, 2) as year
from      sales_data
group by  substr(to_char(t_date,'DD-MM-YY'), 7, 2)

YEAR
====
2014
2013






select    name,  20 || substr(to_char(t_date,'DD-MM-YY'), 7, 2) as year, sum(sold) "Total Sold"
from      sales_data
group by  name, substr(to_char(t_date,'DD-MM-YY'), 7, 2)

NAME	YEAR	Total Sold
==========================
Jason	2014	300
Scott	2013	90
Keith	2013	60
Jon	2013	2
Jon	2014	200
Jesse	2013	120
Jesse	2014	70
Keith	2014	10
Jason	2013	3000
Scott	2014	90
Mallory	2013	130
Jeff	2013	25
Jeff	2014	85






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
-- Who sold the least in 2013?
-- **********************************************************


select    name,  sum(sold) "Total Sold"
from      sales_data
where     substr(to_char(t_date,'DD-MM-YY'), 7, 2) = '13'
group by  name
having    sum(sold)  <= all 
                            (select    sum(sold) 
                             from      sales_data
                             where     substr(to_char(t_date,'DD-MM-YY'), 7, 2) = '13'
                             group by  name)



NAME	Total Sold
==================
Jon	2








-- **********************************************************
-- Who sold the least in 2014?
-- **********************************************************


select    name,  sum(sold) "Total Sold"
from      sales_data
where     20 || substr(to_char(t_date,'DD-MM-YY'), 7, 2) like '%14'
group by  name
having    sum(sold)  <= all 
                            (select    sum(sold) 
                             from      sales_data
                             where     substr(to_char(t_date,'DD-MM-YY'), 7, 2) = '14'
                             group by  name)
order by  name;


NAME	Total Sold
==================
Keith	10







select    name,  sum(sold) "Total Sold"
from      sales_data
where     to_char(t_date,'YY') like '%14'
group by  name
having    sum(sold)  <= all 
                            (select    sum(sold) 
                             from      sales_data
                             where     to_char(t_date,'YYYY') = 2014
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





