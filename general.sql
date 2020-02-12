-- Forouraghi
-- CSC DBMS

-- This example demonstrates:

   -- recursive table creation in SQL
   -- declaration of constraints/primary keys/foreign keys
   -- creating/deleting views
   -- aggregates (min, max, sum, count)
   -- attribute renaming
   -- subqueries (some, all, any, in)
   -- dynamic view computation
   -- order by clause
   -- commit and rollback





-- *************************************************************
-- Create the first relation
-- *************************************************************
create table employees 
(
    id     number(4) not null,
    name   varchar(40),
    salary number(10,2),
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

create view managers as 
(
   select id, name, salary
   from   employees, (select mid from managed)
   where  id = mid
);

select * from managers;
======================
ID	NAME	SALARY
300	Jill	175000
200	Mary	55000
100	Tim	100000
100	Tim	100000


drop view managers;

create view managers as 
(
   select distinct id, name, salary
   from   employees, (select mid from managed)
   where  id = mid
);


select * from managers;
=======================
ID	NAME	SALARY
300	Jill	175000
200	Mary	55000
100	Tim	100000





insert into managers values(600, 'Dumb', 123456);
ORA-01732: data manipulation operation not legal on this view






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

*** Give employees a 5% raise; managers receive a 10% raise.

update employees
set    salary = 1.1 * salary;

ID	NAME	SALARY
100	Tim	110000
200	Mary	60500
500	Zeld	44000
300	Jill	192500
400	Jack	66000






-- *************************************************************
-- Views are computed dynamically; order by clause
-- *************************************************************


create view managers as 
(
   select id, name, salary
   from   employees, (select mid from managed)
   where  id = mid
);

select distinct * from managers;

ID	NAME	SALARY
======================
300	Jill	175000
200	Mary	55000
100	Tim	100000

 

insert into employees values (600, 'Mark', 150000);
insert into managed   values (600, 100);


select distinct * 
from   managers
order  by name;

ID	NAME	SALARY
======================
300	Jill	175000
600	Mark	150000
200	Mary	55000
100	Tim	100000



select distinct * 
from   managers 
order  by name desc;

ID	NAME	SALARY
======================
100	Tim	100000
200	Mary	55000
600	Mark	150000
300	Jill	175000






-- ********************************************************************
-- Rollback to the last committed state
-- By default Oracle commits every operation unless otherwise specified
-- ********************************************************************


Check off Autocommit option on top of the SQL command windows

select * from employees;      <===== this is the last committed state

100	Tim	100000
200	Mary	55000
300	Jill	175000
400	Jack	60000
500	Zeld	40000






insert into employees values (600, 'Zack', 150000);
insert into employees values (700, 'Pat',  50000);

select * from employees order by id;

100	Tim	100000
200	Mary	55000
300	Jill	175000
400	Jack	60000
500	Zeld	40000
600	Zack	150000
700	Pat	50000

rollback;

select * from employees order by id;

100	Tim	100000           <===== returns to the last committed state
200	Mary	55000
300	Jill	175000
400	Jack	60000
500	Zeld	40000








insert into employees values (600, 'Zack', 150000);
insert into employees values (700, 'Pat',  50000);

commit;

rollback;

select * from employees order by id;

100	Tim	100000           <===== returns to the last committed state
200	Mary	55000
300	Jill	175000
400	Jack	60000
500	Zeld	40000
600	Zack	150000
700	Pat	50000





















