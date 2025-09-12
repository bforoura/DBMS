-- Forouraghi
-- CSC DBMS 

-- This example demonstrates:

   -- recursive table creation in SQL
   -- declaration of constraints/primary keys/foreign keys
   -- creating/deleting views
   -- aggregates (min, max, sum, count)
   -- attribute renaming
   -- subqueries (some, all, any, in)

 


-- *************************************************************
-- Safe updates
-- *************************************************************
set SQL_SAFE_UPDATES=0;
set FOREIGN_KEY_CHECKS=0;

-- *************************************************************
-- Create the first relation
-- *************************************************************
create table employees 
(
    id     integer(4) not null,
    name   varchar(40),
    salary decimal(10,2),
    constraint id_constr  check (id between 0 and 9999),
    constraint sal_constr check (salary between 0 and 99999999), 
    primary key(id)   
);



insert into employees values(100, 'Tim',   100000);
insert into employees values(200, 'Mary',  55000);
insert into employees values(300, 'Jill',  175000);
insert into employees values(400, 'Jack',  60000);
insert into employees values(500, 'Zelda', 40000);



select * from employees;
=======================
ID	NAME	SALARY
100	Tim	100000
200	Mary	55000
500	Zelda	40000
300	Jill	175000
400	Jack	60000






-- *************************************************************
-- Create the second relation
-- *************************************************************
create table managed
(
   mid     number(4) not null,
   eid     number(4) not null,
   foreign key(mid) references employees(id),
   foreign key(eid) references employees(id)
);



insert into managed values(100,200);
insert into managed values(100,300);
insert into managed values(300,400);
insert into managed values(200,500);



select * from managed;
=====================
MID	EID
100	300
300	400
100	200
200	500




-- *************************************************************
-- Create/drop a view
-- *************************************************************

-- A non-materialized view (also simply called a "view") is essentially a 
-- virtual table that does not store data physically. It just stores the SQL 
-- query that defines the view. When you query the view, the database re-runs 
-- the query each time you access it, fetching the data dynamically.

create view managers as 
(
   select id, name, salary
   from  employees
   where id in (select mid from managed)
);

select * from managers;
======================
ID	NAME	SALARY
300	Jill	175000
200	Mary	55000
100	Tim	100000
100	Tim	100000


-- drop view managers;


-- a view is read-only
insert into managers values(600, 'Somebody', 123456);

-- let's check managers and employees now

select * from managers;
select * from employees;



-- *************************************************************
-- Aggregates in SQL
-- *************************************************************

select max(salary) from managers;

MAX(SALARY)
===========
175000




select max(salary) as MaxSalary from managers;

MAXSALARY
=========
175000





-- *************************************************************
-- Subqueries in SQL allow you to build a cascade of expressions
-- *************************************************************
*** Find ID of the highest-paid manager.

select id 
from   managers
where  salary = (select max(salary) from managers);

ID
===
300





*** Find ID of those managed by the highest-paid manager.

select eid
from   managed
where  mid = (
              select id 
              from   managers
              where  salary = (select max(salary) from managers)
             );

EID
===
400





*** Find all information about those managed by the highest-paid manager.

select *
from   employees
where  id = (
            select eid
            from   managed
            where  mid = (
                         select id 
                         from   managers
                         where  salary = (select max(salary) from managers)
                         )
            );


ID	NAME	SALARY
======================
400	Jack	60000









-- *************************************************************
-- Aggregates in SQL
-- *************************************************************
*** Find smallest salary.

select min(salary) 
from employees;

MIN(SALARY)
===========
40000




*** Find how many records there are in the relation.

select count(*) 
from employees;

COUNT(*)
========
5




*** Find average salary.

select sum(salary)/count(salary) as AvgSalary 
from employees;

AVGSALARY
=========
86000



*** Find average salary.

select avg(salary) 
from employees;

AVG(SALARY)
===========
86000





-- *************************************************************
-- Subqueries using all, some, any, in and relational operators
-- *************************************************************

*** Find who is the lowest-paid employee.

select id, name, salary
from employees 
where salary <= all (select salary from employees);

ID	NAME	SALARY
======================
500	Zelda	40000





select id, name, salary
from employees 
where salary <= some (select salary from employees)

ID	NAME	SALARY
======================
500	Zelda	40000
200	Mary	55000
400	Jack	60000
100	Tim	100000
300	Jill	175000





select id, name, salary
from employees 
where salary <= some (select salary from employees)

ID	NAME	SALARY
======================
500	Zeld	40000
200	Mary	55000
400	Jack	60000
100	Tim	100000
300	Jill	175000





select id, name, salary
from employees 
where salary < all (select salary from employees)


no data found




select id, name, salary
from employees 
where salary = (select min(salary) from employees)   <=== when subqueries returns only one row
                                                          '=' and '= some' and '= any' become
                                                          interchangeable     
                                
ID	NAME	SALARY
======================
500	Zelda	40000





select id, name, salary
from employees 
where salary in (select min(salary) from employees)

ID	NAME	SALARY
======================
500	Zelda	40000






-- *************************************************************
-- Updating relations
-- *************************************************************

*** Give employees a 10% raise.

update employees
set    salary = 1.1 * salary;

ID	NAME	SALARY
100	Tim	110000
200	Mary	60500
500	Zeld	44000
300	Jill	192500
400	Jack	66000



















