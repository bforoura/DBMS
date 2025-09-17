STEP 1: 
======
create table employees (

     fname      varchar(100),
     lname      varchar(100),
     salary     float,
     company    varchar(100),
     department varchar(100),

     constraint salary_constraint  check (salary between 100 and 1000000),
     constraint company_constraint check (company in ('Adobe', 'Google','Microsoft', 'Apple', 'Yahoo')),
     constraint dept_constraint    check (department in ('Accounting', 'IT', 'Advertising', 'Customer Service'))
)



STEP 2:
======
Load into the system the data file "employees_data.csv" as follows:

	Go to Home / Utilities / Data Load / Load Text Data
	Select "Load Data to Exisiting Table"
	Next
	Select table "EMPLOYEES"
	Next
	Choose File "employees_data.csv"
	   Use comma "," separtaor
	   Uncheck "First row contains column names"
	Next
	Select appropriate column name for each column (e.g. fname, lname, etc.)
	Load Data
	Make sure all 200 tuples were successfully added to the table. 
	In case of failure go back and carefully redo above steps












Query 1: List the companies in alphabetic order
===============================================

select   distinct(company) 
from     employees
order by company


COMPANY
=======
Adobe
Apple
Google
Microsoft
Yahoo








Query 2: List no. employees in each company
================================================

select   company, count(*)
from     employees
group by company
order by count(*) desc

COMPANY		COUNT(*)
========================
Microsoft	46
Yahoo		40
Apple		39
Adobe		38
Google		37


or


select    company, count(*) "No. Employees"
from      employees
group by  company
order by "No. Employees" desc

COMPANY	No. Employees
=====================
Microsoft	46
Yahoo		40
Apple		39
Adobe		38
Google		37







Query 3: Which comapny has the most employees?
==============================================

select company, count(*)
from employees
group by company
having count(*) >= all 
      (
       select count(*)
       from employees
       group by company)



COMPANY		COUNT(*)
========================
Microsoft	46










Query 4: How many people work in each department at Microsft?
=============================================================
select   company, department, count(*)
from     employees
where    company = 'Microsoft'
group by company, department
order by company, department



COMPANY		DEPARTMENT		COUNT(*)
================================================
Microsoft	Accounting		11
Microsoft	Advertising		6
Microsoft	Customer Service	18
Microsoft	IT			11




Grouping by "company" is redundant though so the following 
will produce the same results:



select    department, count(*)
from      employees
where     company = 'Microsoft'
group by  department
order by  department


DEPARTMENT		COUNT(*)
================================
Accounting		11
Advertising		6
Customer Service	18
IT			11







Query 5: Which department at Microsoft has the most employees?
==============================================================

select department, count(*)
from employees
where company = 'Microsoft'
group by department
having count(*) >= all (
               select count(*)
               from employees
               where company = 'Microsoft'
               group by department)
               
               
DEPARTMENT		COUNT(*)
================================
Customer Service	18             
               
               
  
   
or, alternatively, we can create an alias called MS_employees using SQL's "with" clause:


with ms_employees as (select * from employees where company='Microsoft')

select   department, count(*)
from     ms_employees
group by department
having count(*) >= all (
                        select   count(*)
                        from     ms_employees
                        group by department)
               
               
               






Query 6: List no. employees per department at each company
===============================================================

select    company, department, count(*)
from      employees
group by  company, department
order by  company, department



COMPANY		DEPARTMENT		COUNT(*)
================================================
Adobe		Accounting		12
Adobe		Advertising		10
Adobe		Customer Service	6
Adobe		IT			10

Apple		Accounting		8
Apple		Advertising		9
Apple		Customer Service	14
Apple		IT			8

Google		Accounting		7
Google		Advertising		6
Google		Customer Service	13
Google		IT			11

Microsoft	Accounting		11
Microsoft	Advertising		6
Microsoft	Customer Service	18
Microsoft	IT			11

Yahoo		Accounting		7
Yahoo		Advertising		14
Yahoo		Customer Service	9
Yahoo		IT			10






Query 7: Which department at each company has the most employees?
=================================================================
select    company, department, count(*)
from      employees
group by  company, department
having    count(*) >= all (
                           select    count(*)
                           from      employees
                           group by  company, department)
                           
                           
                           
COMPANY		DEPARTMENT		COUNT(*)
================================================
Microsoft	Customer Service	18




But the above answer is wrong because we must not compare departments 
within a company to departments in other companies



select    company, department, count(*)
from      employees e
group by  company, department
having    count(*) >= all (
                           select    count(*)
                           from      employees
                           where     company = e.company
                           group by  company, department)
order by count(*) desc




COMPANY		DEPARTMENT		COUNT(*)
================================================
Microsoft	Customer Service	18
Yahoo		Advertising		14
Apple		Customer Service	14
Google		Customer Service	13
Adobe		Accounting		12
                           
                           
                           
                           
                           
                           
                           
                           
                           
                           
                           
                           
                           
                         

