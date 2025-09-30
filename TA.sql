-- *************************************************************
-- Safe updates
-- *************************************************************
set SQL_SAFE_UPDATES=0;
set FOREIGN_KEY_CHECKS=0;

use ta;    


-- *************************************************************
-- Two-way joins
-- *************************************************************


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


-- *************************************************************
-- Three-way joins, Set operations
-- *************************************************************


-- ******************************************************************
create table students (
    sid int not null primary key,
    name   varchar(20)
);
insert into students values (10, "Katrina"), (20, "Albert"), (30, "Sean"), (40, "Emily"), (50, "Jimmy");
 
delete from students;
 
create table courses (
    cno int not null primary key,
    name   varchar(20)
);
insert into courses values (362, "AI"), (352, "DBMS"), (240, "DISCR"), (201, "DSTRT"), (281, "DAA");

create table work (
    sid int,
    cno int,
    foreign key(sid) references students(sid),
    foreign key(cno) references courses(cno)
);
insert into work values (10,362), (10, 352), (20, 240), (30, 201);
-- ******************************************************************

-- ******************************************************************
-- List TAs and their courses
-- ******************************************************************
select students.name, courses.name 
from   students, work, courses
where  students.sid = work.sid and courses.cno = work.cno;

-- ******************************************************************
-- What are Katrina's courses?
-- ******************************************************************
select students.name, courses.name 
from   students, work, courses
where  students.sid = work.sid and courses.cno = work.cno and students.name='Katrina';

-- What's wrong here?
select  *
from    students natural join work 
                 natural join courses
where   (name='Katrina');


-- ******************************************************************
-- Join columns may have different names
-- ******************************************************************
select students.name, courses.name 
from   students inner join work on (students.sid = work.sid)
                inner join courses on (courses.cno = work.cno)
where  students.name='Katrina';


-- ******************************************************************
-- Join columns have the same names
-- ******************************************************************
select students.name, courses.name 
from   students inner join work using (sid)
                inner join courses using (cno)
where  students.name='Albert';



-- ******************************************************************
-- Version 1: Who is not a TA?
-- ******************************************************************
select students.name from students

except    -- "except all" retains duplicates
 
select students.name
from   students inner join work on (students.sid = work.sid)
                inner join courses on (courses.cno = work.cno);


-- ******************************************************************
-- Version 2: Who is not a TA?
-- ******************************************************************
select students.name
from students left outer join work 
     using (sid) -- on students.sid = work.sid
where work.sid is null;


-- ******************************************************************
-- Which courses have no TAs?
-- ******************************************************************
select courses.name
from work right outer join courses 
     on courses.cno = work.cno
where work.cno is null;


-- **************************************************************************
-- Full join is not supported in MySQL; instead we union
--     Intersection (Matched Rows): A ∩ B (The INNER JOIN or NATURAL JOIN result)
--     Left-Only Rows: A−B (Rows only in the left table)
--     Right-Only Rows: B−A (Rows only in the right table)

-- But, since both the LEFT JOIN and the RIGHT JOIN include the intersection, that 
-- data is inherently part of the FULL JOIN without needing to be added separately 
-- via a third UNION operation.

-- **************************************************************************
select students.sid, students.name, work.cno, courses.name
from students left join work using(sid)
			  left join courses using(cno)
union
select students.sid, students.name, work.cno, courses.name
from students right join work using (sid)
              right join courses using (cno)


