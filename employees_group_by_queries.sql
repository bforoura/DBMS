GROUP BY and HAVING commands in SQL
===================================
	
SELECT column1, column2, aggregate_function(column3)
FROM table_name
WHERE condition
GROUP BY column1, column2;

Grouping: The GROUP BY groups rows that have the same values in specified columns into summary rows, 
	      like "total sales per department" or "average salary by department".
	
Aggregate Functions: The columns listed in the SELECT clause that are not part of the GROUP BY 
	       must use aggregate functions (e.g., SUM(), COUNT(), MAX(), etc.).

Order of Execution: GROUP BY comes after WHERE but before HAVING and ORDER BY.




-- ==============================================================================================
-- Query 0: Import the data file "employees_data.csv" first using the Table Data Import Wizard 
--  (right-click in Schemas Navigator)
-- ==============================================================================================


	
-- ===============================================
-- Query 1: List the companies in alphabetic order
-- ===============================================

select   distinct(company) 
from     employees_data
order by company;


	
-- ===============================================
-- Query 2: List no. employees in each company
-- ================================================

select   company, count(*)
from     employees_data
group by company
order by count(*) desc;

-- alternatively,

select    company, count(*) as "No. Employees"
from      employees
group by  company
order by "No. Employees" desc;


-- ==============================================
-- Query 3: Which comapany has the most employees?
-- ==============================================

select company, count(*)
from employees_data
group by company
having count(*) >= all 
      (
       select count(*)
       from employees_data
       group by company);



-- =============================================================
-- Query 4: How many people work in each department at Microsft?
-- =============================================================
select   company, department, count(*)
from     employees_data
where    company = 'Microsoft'
group by company, department
order by company, department;


-- Grouping by "company" is redundant so the following will produce the same results:

select    department, count(*)
from      employees_data
where     company = 'Microsoft'
group by  department
order by  department;


-- ==============================================================
-- Query 5: Which department at Microsoft has the most employees?
-- ==============================================================

select department, count(*)
from employees_data
where company = 'Microsoft'
group by department
having count(*) >= all (
               select count(*)
               from employees_data
               where company = 'Microsoft'
               group by department);
               
               

--  alternatively, we can create an alias called MS_employees using SQL's "with" clause:


with ms_employees as (select * from employees_data where company='Microsoft')

select   department, count(*)
from     ms_employees
group by department
having count(*) >= all (
                        select   count(*)
                        from     ms_employees
                        group by department);
               
               
               
-- ===============================================================
-- Query 6: List no. employees per department at each company
-- ===============================================================

select    company, department, count(*)
from      employees
group by  company, department
order by  company, department;



-- ===============================================================
-- Query 7: Which department at each company has the most employees?
-- ===============================================================

select    company, department, count(*)
from      employees_data e
group by  company, department
having    count(*) >= all (
                           select    count(*)
                           from      employees_data
                           where     company = e.company
                           group by  company, department)
order by count(*) desc;



                           
                           
                           
                           
                           
                           
                           
                           
                           
                         

