create table deposit (
      branch_name    varchar(50),
      accnt_num      integer(5),
      cust_name      varchar(50),
      bal            numeric (20,2)
  );
  
  insert into deposit values ('1st & Locust', 111, 'Jones', 100.00);
  insert into deposit values ('Main', 121, 'Smith', 120.00);
  insert into deposit values ('Redwood', 234, 'Thompson', 1450.00);
  insert into deposit values ('Briar Rose', 456, 'Adams', 2400);
  insert into deposit values ('Main', 123, 'Marcus', 2400.00);