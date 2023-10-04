
(1) Create the relations shown below and make sure that:
	-- at least a primary key
	-- foreign key(s), if needed
	-- named column constraints, as deemed necessary, for both categorical
	   data (DEPTNO, Sex, etc.) as well as numeric data (date, salary, etc.)


(2) Convert the following queries to SQL:
	(a) List names of departments, their managers and total number of employees.
	(b) In which department does the highest-paid female employee work?
	(c) What is the average wage each department pays its male and female employees?
	(d) Who is the youngest, highest-paid employee?
	(e) Who has been assigned to work on the OPERATION project and for how long?
	(f) Which department has the least number of employees?
	(g) Which project has been assigned the largest number of employees?


=====================
Relation: departments
=====================
Attributes:
	Department number
	Name describing general activities of department
	Employee number (EMPNO) of department manager


-- *** department relation:
create table departments
(
    dept_id varchar(3) not null,
    name varchar(40) not null,
    manager_id number(6) not null,
    
    constraint dept_man_id_const check (manager_id between 0 and 999999),
    primary key(dept_id)
);



=====================
Relation: employees
===================
Attributes:
	Employee number
	First name
	Last name

	Department (DEPTNO) in which the employee works
	Date of hire
		
	Job       -- 'PRES', 'MANAGER', 'SALESREP', 'CLERK', 'ANALYST', 'DESIGNER', 'OPERATOR', 'FIELDREP'
	Sex
	Birthdate
	Salary
	Yearly Bonus
	Yearly Commision


--*** employees relation:
create table employees
(
    emp_id number(6) not null,
    f_name varchar(15) not null,
    l_name varchar(20) not null,
    dept_id varchar(3) not null,
    date_hired date not null,
    job varchar(10) check (job in ('PRES', 'MANAGER', 'SALESREP', 'CLERK', 'ANALYST', 'DESIGNER', 'OPERATOR', 'FIELDREP')),
    sex char(1) check (sex in ('M', 'F')),
    birthdate date not null,
    salary number(5) not null,
    bonus number(4) not null,
    commission number(4) not null,
    
    constraint emp_sal_const check (salary between 0 and 99999),
    constraint emp_bonus_const check (bonus between 0 and 9999),
    constraint emp_com_const check (commission between 0 and 9999),
    
    primary key(emp_id),
    foreign key(dept_id) references departments(dept_id)
    
);



=============================
Relation: employee_activities
=============================
Attributes:
	Employee number
	Project number
	Proportion of employee's time spent on project -- a percentage
	Date activity starts
	Date activity ends


--*** employee_activities relation:
create table employee_activities
(
    emp_id number(6) not null,
    project_id varchar(6) not null,
    time number(3,2) not null,
    start_date date not null,
    end_date date not null,
    
    constraint emp_act_time_const check (time <= 1.00),
    
    foreign key(emp_id) references employees(emp_id),
    foreign key(project_id) references projects(project_id)
);





=============================
Relation: project_information
=============================
Attributes:
	Project number
	Project name
	Department responsible
	Employee responsible
	Estimated start date
	Estimated end date


--*** projects relation:
create table projects
(
    project_id varchar(6) not null,
    project_name varchar(30) not null,
    dept_id varchar(3) not null,
    emp_id number(6) not null,
    
    start_date date not null,
    end_date date not null,
    
    primary key(project_id),
    foreign key(dept_id) references departments(dept_id),
    foreign key(emp_id) references employees(emp_id)
);






	
-- **********************************************************************************
-- query(a): List names of departments, their managers and total number of employees.
-- **********************************************************************************

select d.name as "Department Name", e.f_name || ' ' || e.l_name as "Manager Name", c.emp_cnt as "Number of Employees"
from departments d, employees e,
                              (select dept_id, count(*) as emp_cnt
                               from employees
                               group by dept_id
                              ) c
where d.manager_id = e.emp_id
and d.dept_id = c.dept_id;





-- **********************************************************************************
-- query(b): In which department does the highest-paid female employee work?
-- **********************************************************************************

select d.name
from employees e, departments d
where e.dept_id = d.dept_id
and e.salary = (select max(salary)
                from (select *
                      from employees
                      where sex = 'F'
                      )
                );




-- **************************************************************************************
-- query(c): What is the average wage each department pays its male and female employees?
-- **************************************************************************************

select m.dept_name, m.msal as "Average Male Salary", f.fsal as "Average female Salary"
from
    (select dpt.name as dept_name, m2.m_sal as msal
    from
         (select d.name as dept_name, avg(salary) as m_sal
          from employees e, departments d
          where e.dept_id = d.dept_id
          and sex = 'M'
          group by d.name) m2 full join 
          departments dpt
          on dpt.name = m2.dept_name) m full join
    (select dpt.name as dept_name, f2.f_sal as fsal
    from
         (select d.name as dept_name, avg(salary) as f_sal
          from employees e, departments d
          where e.dept_id = d.dept_id
          and sex = 'F'
          group by d.name) f2 full join 
          departments dpt
          on dpt.name = f2.dept_name) f
    on m.dept_name = f.dept_name;





-- **************************************************************************************
-- query(d): Who is the youngest, highest-paid employee?
-- **************************************************************************************

select y.youngest as "Youngest Employee", h.highest as "Highest-Paid Employee"
from
    (select f_name || ' ' || l_name as youngest
     from employees
     where birthdate = (select max(birthdate)
                        from employees
                        )
     ) y, 
    (select f_name || ' ' || l_name as highest
     from employees
     where salary = (select max(salary)
                     from employees
                    )
     ) h;



		
		
		
-- **************************************************************************************
-- query(e): Who has been assigned to work on the OPERATION project and for how long?
-- **************************************************************************************

select e.f_name || ' ' || e.l_name as "Employee Name", a.end_date-a.start_date as Days
from projects p, employee_activities a, employees e
where p.project_id = a.project_id and 
     a.emp_id = e.emp_id and 
     p.project_name = 'OPERATION';






-- **************************************************************************************
-- query(f): Which department has the least number of employees?
-- **************************************************************************************

select d.name, c.emps
from departments d,
    (select e.dept_id as dept_id, count(*) as emps
     from employees e
     group by dept_id) c
where d.dept_id = c.dept_id and c.emps <= all 
                  (select count(*) as emps
                   from employees e
                   group by dept_id);








-- **************************************************************************************
-- query(g): Which project has been assigned the largest number of employees?
-- **************************************************************************************

select p.project_name
from projects p, 
    (select a.project_id as id, count(*) as cnt
     from employee_activities a
     group by a.project_id) c
where p.project_id = c.id and c.cnt = 
            (select max(count(*))
             from employee_activities 
             group by project_id);


















