-- The examples here demonstrate:

   -- group by and having
   -- more on order by
   -- date data type
   -- aliasing columns
   -- like vs. = for string comparison
   -- more on subqueries
   -- exists





-- *************************************************************
-- Create the relation
-- *************************************************************

CREATE TABLE csc621 (
    id     INT(3) NOT NULL,
    major  VARCHAR(4),
    gpa    DECIMAL(3,2),
    PRIMARY KEY (id),
    CHECK (major IN ('CSC', 'MAT', 'ASC')),
    CHECK (gpa BETWEEN 0.00 AND 4.00)
);

-- populate the table with these tuples
INSERT INTO csc621 (id, major, gpa) VALUES
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
	
SELECT AVG(gpa) AS `Class Average` FROM csc621;

-- Rounded to 2 decimal places
SELECT ROUND(AVG(gpa), 2) AS `Class Average` FROM csc621;




select to_char(avg(gpa), '99.99') "Class Average"
from csc621;


-- *************************************************************
-- What's the average GPA of each group of majors in the class?
-- *************************************************************

SELECT major AS `Major`, ROUND(AVG(gpa), 2) AS `Major GPA`
FROM csc621
GROUP BY major;



-- *************************************************************
-- Which major has the highest avg gpa?
-- *************************************************************

SELECT major, ROUND(AVG(gpa), 2) AS avg_gpa
FROM csc621
GROUP BY major
HAVING AVG(gpa) >= ALL (
    SELECT AVG(gpa) FROM csc621 GROUP BY major
);





-- *************************************************************
-- Find CSC majors with GPA above average?
-- *************************************************************

SELECT id, gpa
FROM csc621
WHERE major = 'CSC'
  AND gpa > (
      SELECT AVG(gpa)
      FROM csc621
      WHERE major = 'CSC'
  )
ORDER BY id, gpa;




-- *************************************************************
-- Create a new relation sales_data
-- *************************************************************

CREATE TABLE sales_data (
    name   VARCHAR(50),
    sold   INT,
    t_date DATE
);

INSERT INTO sales_data (name, sold, t_date) VALUES
('Keith', 20, STR_TO_DATE('24-AUG-23', '%d-%b-%y')),
('Keith', 40, STR_TO_DATE('15-SEP-23', '%d-%b-%y')),
('Keith', 10, STR_TO_DATE('12-DEC-24', '%d-%b-%y')),
('Mallory', 100, STR_TO_DATE('12-AUG-23', '%d-%b-%y')),
('Mallory', 30, STR_TO_DATE('12-SEP-23', '%d-%b-%y')),
('Jason', 300, STR_TO_DATE('12-AUG-24', '%d-%b-%y')),
('Jason', 3000, STR_TO_DATE('11-OCT-23', '%d-%b-%y')),
('Jon', 2, STR_TO_DATE('12-AUG-23', '%d-%b-%y')),
('Jon', 200, STR_TO_DATE('12-AUG-24', '%d-%b-%y')),
('Scott', 30, STR_TO_DATE('24-AUG-23', '%d-%b-%y')),
('Scott', 60, STR_TO_DATE('19-SEP-23', '%d-%b-%y')),
('Scott', 90, STR_TO_DATE('20-DEC-24', '%d-%b-%y')),
('Jesse', 120, STR_TO_DATE('12-AUG-23', '%d-%b-%y')),
('Jesse', 70, STR_TO_DATE('12-AUG-24', '%d-%b-%y')),
('Jeff', 25, STR_TO_DATE('10-FEB-23', '%d-%b-%y')),
('Jeff', 85, STR_TO_DATE('22-JUN-24', '%d-%b-%y'));

select * from sales_data;






-- *************************************************************
-- Display 2023 sales data
-- *************************************************************
SELECT * FROM sales_data
WHERE YEAR(t_date) = 2023;




-- *************************************************************
-- What was the total sales in 2023?
-- *************************************************************

SELECT SUM(sold) AS total_sales_2023
FROM sales_data
WHERE YEAR(t_date) = 2023;


-- *************************************************************
-- What were the total sales in different months in 2023?
-- *************************************************************

SELECT UPPER(DATE_FORMAT(t_date, '%b')) AS `Month`, SUM(sold) AS `Total Sales`
FROM sales_data
WHERE YEAR(t_date) = 2023
GROUP BY MONTH(t_date)
ORDER BY `Total Sales`;





-- *************************************************************
-- What were the total sales in 2023 and 2024?
-- *************************************************************

SELECT YEAR(t_date) AS `Year`, SUM(sold) AS `Total Sales`
FROM sales_data
GROUP BY YEAR(t_date);









-- *************************************************************
-- Group sales data by year and month
-- *************************************************************

SELECT YEAR(t_date) AS `Year`, UPPER(DATE_FORMAT(t_date, '%b')) AS `Month`, SUM(sold) AS `Total`
FROM sales_data
GROUP BY YEAR(t_date), MONTH(t_date)
ORDER BY `Year`, MONTH(t_date);









-- *************************************************************
-- More on formats
-- *************************************************************

SELECT DATE_FORMAT(t_date, '%Y') AS yr
FROM sales_data
ORDER BY yr;


-- **********************************************************
-- Group by year from date.
-- **********************************************************

SELECT name, YEAR(t_date) AS year, SUM(sold) AS `Total Sold`
FROM sales_data
GROUP BY name, year;






-- **********************************************************
-- Who sold the most over the years?
-- **********************************************************

-- sale by person
SELECT name, SUM(sold) AS `Total Sold`
FROM sales_data
GROUP BY name
ORDER BY `Total Sold`;

-- who sold the most
SELECT name, SUM(sold) AS `Total Sold`
FROM sales_data
GROUP BY name
HAVING SUM(sold) >= ALL (
    SELECT SUM(sold)
    FROM sales_data
    GROUP BY name
);






-- **********************************************************
-- Who sold the least in 2023?
-- **********************************************************

SELECT name, SUM(sold) AS `Total Sold`
FROM sales_data
WHERE YEAR(t_date) = 2023
GROUP BY name
HAVING SUM(sold) <= ALL (
    SELECT SUM(sold)
    FROM sales_data
    WHERE YEAR(t_date) = 2023
    GROUP BY name
);



-- ************************************************************
-- use exists to find out if there were any sales in JAN or DEC
-- ************************************************************
SELECT CASE
         WHEN EXISTS (
           SELECT 1
           FROM sales_data
           WHERE MONTH(t_date) IN (1, 12)
         )
         THEN 1 ELSE 0
       END AS `1/Yes 0/No`;





