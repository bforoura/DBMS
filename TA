-- *************************************************************
-- Safe updates
-- *************************************************************
set SQL_SAFE_UPDATES=0;
set FOREIGN_KEY_CHECKS=0;

use ta;
-- ******************************************************************
create table students (
    sid int not null primary key,
    name   varchar(20)
);
insert into students values (10, "Katrina"), (20, "Albert"), (30, "Sean");
 
create table ta_work (
    sid int,
    cname   varchar(20),
    foreign key(sid) references students(sid)
);
 insert into ta_work values (10, "CSC362"), (10, "CSC352"), (20, "CSC240"), (30, "CSC201");
 -- ******************************************************************

-- cross product of two tables
select * from students, ta_work;
select * from students cross join ta_work;

-- List TAs and their courses
select students.sid, name, cname 
from   students, ta_work
where  students.sid = ta_work.sid;

-- What are Katrina's courses?
select cname
from    students, ta_work
where   (students.sid = ta_work.sid) and (name='Katrina');

select  cname
from    students natural join ta_work
where   (name='Katrina');

-- join columns may have different names
select cname
from    students inner join ta_work on (students.sid = ta_work.sid)
where   (name='Katrina');

-- join columns have the same names
select  cname
from    students inner join ta_work using(sid)
where   (name='Katrina');

-- Who is the TA for CSC240?
select name
from    students inner join ta_work on (students.sid = ta_work.sid)
where   (cname='CSC240');


