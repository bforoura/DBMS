-- The examples here demonstrate:

   -- group by and having
   -- more on order by
   -- date data type
   -- aliasing columns
   -- more on subqueries
   -- exists





-- *************************************************************
-- Create the relation
-- *************************************************************

create table csc621 (
    id     int(3) not null,
    major  varchar(4),
    gpa    decimal(3,2),
    primary key (id),
    check (major in ('CSC', 'MAT', 'ASC')),
    check (gpa between 0.00 and 4.00)
);

-- populate the table with these tuples
insert into csc621 (id, major, gpa) values
(100, 'CSC', 3.2),
(110, 'CSC', 3.4),
(120, 'CSC', 3.8),
(130, 'CSC', 4.0),
(210, 'MAT', 2.9),
(220, 'MAT', 2.0),
(230, 'MAT', 3.0),
(300, 'ASC', 1.0),
(310, 'ASC', 1.1);


select *  from csc621;


-- *************************************************************
-- What's the average GPA of all students enrolled in the class?
-- *************************************************************
	
select avg(gpa) as `Class Average` from csc621;

-- Rounded to 2 decimal places
select round(avg(gpa), 2) as `Class Average` from csc621;


-- *************************************************************
-- What's the average GPA of each group of majors in the class?
-- *************************************************************

select major as `Major`, round(avg(gpa), 2) as `Major GPA`
from csc621
group by major;



-- *************************************************************
-- Which major has the highest avg gpa?
-- *************************************************************

select major, round(avg(gpa), 2) as avg_gpa
from csc621
group by major
having avg(gpa) >= all (
    select avg(gpa) from csc621 group by major
);





-- *************************************************************
-- Find CSC majors with GPA above average?
-- *************************************************************

select id, gpa
from csc621
where major = 'CSC'
  and gpa > (
      select avg(gpa)
      from csc621
      where major = 'CSC'
  )
order by id, gpa;




-- *************************************************************
-- Create a new relation sales_data
-- *************************************************************

create table sales_data (
    name   varchar(50),
    sold   int,
    t_date date
);

insert into sales_data (name, sold, t_date) values
('Keith', 20, str_to_date('24-AUG-23', '%d-%b-%y')),
('Keith', 40, str_to_date('15-SEP-23', '%d-%b-%y')),
('Keith', 10, str_to_date('12-DEC-24', '%d-%b-%y')),
('Mallory', 100, str_to_date('12-AUG-23', '%d-%b-%y')),
('Mallory', 30, str_to_date('12-SEP-23', '%d-%b-%y')),
('Jason', 300, str_to_date('12-AUG-24', '%d-%b-%y')),
('Jason', 3000, str_to_date('11-OCT-23', '%d-%b-%y')),
('Jon', 2, str_to_date('12-AUG-23', '%d-%b-%y')),
('Jon', 200, str_to_date('12-AUG-24', '%d-%b-%y')),
('Scott', 30, str_to_date('24-AUG-23', '%d-%b-%y')),
('Scott', 60, str_to_date('19-SEP-23', '%d-%b-%y')),
('Scott', 90, str_to_date('20-DEC-24', '%d-%b-%y')),
('Jesse', 120, str_to_date('12-AUG-23', '%d-%b-%y')),
('Jesse', 70, str_to_date('12-AUG-24', '%d-%b-%y')),
('Jeff', 25, str_to_date('10-FEB-23', '%d-%b-%y')),
('Jeff', 85, str_to_date('22-JUN-24', '%d-%b-%y'));

select * from sales_data;






-- *************************************************************
-- Display 2023 sales data
-- *************************************************************
select * from sales_data
where year(t_date) = 2023;




-- *************************************************************
-- What was the total sales in 2023?
-- *************************************************************

select sum(sold) as total_sales_2023
from sales_data
where year(t_date) = 2023;


-- *************************************************************
-- What were the total sales in different months in 2023?
-- *************************************************************

select 
    upper(date_format(t_date, '%b')) as `Month`,
    sum(sold) as `Total Sales`
from sales_data
where year(t_date) = 2023
group by upper(date_format(t_date, '%b'))
order by `Total Sales`;





-- *************************************************************
-- What were the total sales in 2023 and 2024?
-- *************************************************************

select year(t_date) as `Year`, sum(sold) as `Total Sales`
from sales_data
group by year(t_date);









-- *************************************************************
-- Group sales data by year and month
-- *************************************************************

select 
    year(t_date) as `Year`, 
    date_format(t_date, '%b') as `Month`, 
    sum(sold) as `Total`
from sales_data
group by year(t_date), date_format(t_date, '%b')
order by `Year`, `Month`;




-- **********************************************************
-- Who sold the most over the years?
-- **********************************************************

-- sales by person
select name, sum(sold) as `Total Sold`
from sales_data
group by name
order by `Total Sold`;

-- who sold the most
select name, sum(sold) as `Total Sold`
from sales_data
group by name
having sum(sold) >= all (
    select sum(sold)
    from sales_data
    group by name
);






-- **********************************************************
-- Who sold the least in 2023?
-- **********************************************************

select name, sum(sold) as `Total Sold`
from sales_data
where year(t_date) = 2023
group by name
having sum(sold) <= all (
    select sum(sold)
    from sales_data
    where year(t_date) = 2023
    group by name
);



-- ************************************************************
-- use exists to find out if there were any sales in JAN or DEC
-- ************************************************************
select case
         when exists (
           select 1
           from sales_data
           where month(t_date) in (1, 12)
         )
         then 1 else 0
       end as `1/Yes 0/No`;


