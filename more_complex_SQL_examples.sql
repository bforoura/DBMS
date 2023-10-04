create table departments
(
    dept_id varchar(3) not null,
    name varchar(40) not null,
    manager_id integer(6) not null,
    
    constraint dept_man_id_const check (manager_id between 0 and 999999),
    primary key(dept_id)
);


create table employees
(
    emp_id integer(6) not null,
    f_name varchar(15) not null,
    l_name varchar(20) not null,
    dept_id varchar(3) not null,
    date_hired date not null,
    job varchar(10) check (job in ('PRES', 'MANAGER', 'SALESREP', 'CLERK', 'ANALYST', 'DESIGNER', 'OPERATOR', 'FIELDREP')),
    sex char(1) check (sex in ('M', 'F')),
    birthdate date not null,
    salary integer(5) not null,
    bonus integer(4) not null,
    commission integer(4) not null,
    
    constraint emp_sal_const check (salary between 0 and 99999),
    constraint emp_bonus_const check (bonus between 0 and 9999),
    constraint emp_com_const check (commission between 0 and 9999),
    
    primary key(emp_id),
    foreign key(dept_id) references departments(dept_id)
    
);

create table employee_activities
(
    emp_id integer(6) not null,
    project_id varchar(6) not null,
    time decimal(3,2) not null,
    start_date date not null,
    end_date date not null,
    
    constraint emp_act_time_const check (time <= 1.00),
    
    foreign key(emp_id) references employees(emp_id),
    foreign key(project_id) references projects(project_id)
);


create table projects
(
    project_id varchar(6) not null,
    project_name varchar(30) not null,
    dept_id varchar(3) not null,
    emp_id integer(6) not null,
    
    start_date date not null,
    end_date date not null,
    
    primary key(project_id),
    foreign key(dept_id) references departments(dept_id),
    foreign key(emp_id) references employees(emp_id)
);














