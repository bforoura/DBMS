/* *******************************************************************************
   The Voting relational model allows for various analyses, such as determining 
   voting trends, calculating candidate support, and understanding voting behavior 
   through SQL operations such as joins, set operations, groupings, and aggregations.
   
   The model consists of three tables: 
   
	+------------------+          +--------------------+
	|      Voter       |          |      Candidate     |
	+------------------+          +--------------------+
	| * voterid (PK)   |          | * candidateid (PK) |
	|   name           |          |   name             |
	|   age            |          |   party            |
	|   city           |          +--------------------+
	+------------------+
			+----------------+--+
			|       Vote        |
			+-----------------+-+
			| * voterid (FK)    |
			| * candidateid (FK)|
			|   votedate        |
			+-------------+-----+



******************************************************************************* */


-- *********************************************************************************
-- create and populate the voters table
-- *********************************************************************************
create table voters (
    voterid int primary key,   -- PK constaint
    
    name varchar(50),
    age int,
    city varchar(50)
);

-- insert data into voters table
insert into voters (voterid, name, age, city) values
(1, 'Alice', 30, 'New York'),
(2, 'Bob', 25, 'Los Angeles'),
(3, 'Charlie', 35, 'Chicago'),
(4, 'David', 28, 'Miami'),
(5, 'Eva', 22, 'San Francisco'),
(6, 'Frank', 40, 'New York'),
(7, 'Grace', 32, 'Los Angeles'),
(8, 'Hannah', 29, 'Chicago'),
(9, 'Ian', 24, 'Miami'),
(10, 'Jack', 36, 'San Francisco');


-- *********************************************************************************
-- create and populate the candidates table
-- *********************************************************************************
create table candidates (
    candidateid int primary key,   -- PK constaint
    
    name varchar(50),
    party varchar(50)
);

-- insert data into candidates table
insert into candidates (candidateid, name, party) values
(1, 'John Smith', 'Democratic'),
(2, 'Jane Doe', 'Republican'),
(3, 'Alex Johnson', 'Independent'),
(4, 'Maria Garcia', 'Green'),
(5, 'Olivia Brown', 'Democratic'),
(6, 'Ethan White', 'Republican'),
(7, 'Sophia Green', 'Independent'),
(8, 'Liam Black', 'Green');



-- *********************************************************************************
-- create and populate the votes table
-- *********************************************************************************
create table votes (
    voterid int,                         -- FK
    candidateid int,                     -- FK
    
    votedate date,                       -- descriptive attribute
    
    -- ensures each voter can vote only once for each candidate
    unique (voterid, candidateid), 
    

    -- foreign key constraints
    foreign key (voterid) references voters(voterid) 
              on delete cascade on update cascade,
    foreign key (candidateid) references candidates(candidateid) 
              on delete cascade on update cascade
);

-- insert data into votes table
insert into votes (voterid, candidateid, votedate) values
(1, 1, '2024-09-01'),
(2, 2, '2024-09-01'),
(3, 1, '2024-09-01'),
(4, 3, '2024-09-01'),
(5, 2, '2024-09-01'),
(1, 5, '2024-09-02'),
(2, 6, '2024-09-02'),
(3, 5, '2024-09-02'),
(4, 7, '2024-09-02'),
(5, 6, '2024-09-02'),
(6, 1, '2024-09-03'),
(7, 2, '2024-09-03'),
(8, 3, '2024-09-03'),
(9, 4, '2024-09-03'),
(10,1, '2024-09-03');



/* ***********************************************************************************
                                      SQL JOINS
                                      
   CROSS JOIN 
   ==========
   When you perform a CROSS JOIN between two tables, every row from the first table is 
   combined with every row from the second table. 
   
   This results in a new table where the number of rows is the product of the number 
   of rows in the two original tables.
   
   CROSS JOIN should be used craefully due to the potential size of the output. 
   
   Assuming relations r(R) and s(S):
   -- r has schema R with arity n and contains n_r rows
   -- s has schema S with arity m and contains n_s rows
   - -r x s has arity (n+m) and contains n_r * n_s rows
   
   SELECT * FROM table1 CROSS JOIN table2; 
   or, alternatively:
   SELECT * FROM table1, table2;    
   
   
   NATURAL JOIN
   ============
   Automatically joins tables based on all columns with the same names and compatible 
   data types in both tables.
   
   SELECT * FROM table1 NATURAL JOIN table2; 
   
   
   INNER JOIN ON
   =============
   Returns only the rows that have matching values in both tables based on a specified 
   condition.
   
   SELECT columns
   FROM table1 INNER JOIN table2 ON table1.column_name = table2.column_name;
   
   which is the same as
   
   SELECT columns
   FROM table1 JOIN table2 ON table1.column_name = table2.column_name;
   
   
   INNER JOIN USING
   ================
   The USING clause can simplify the syntax when performing an INNER JOIN (or just a JOIN) 
   if you are joining on columns with the same name in both tables.
   
   SELECT columns
   FROM table1 JOIN table2
   USING (common_column);
   
   
   NOTE
   ====
   Both keywords NATURAL and INNER are optional. You can choose to write them for clarity, 
   but it's not necessary.
  
********************************************************************************* */

-- *********************************************************************************
-- This query lists all possible combinations of voters and candidates
-- *********************************************************************************
select *
from voters, candidates;    -- same as "from voters cross join candidates;"



-- *********************************************************************************
-- This query counts all possible combinations of voters and candidates
-- *********************************************************************************
select count(*)
from voters, candidates;    


-- *********************************************************************************
-- This query helps to visualize how voters might choose candidates 
-- based on demographics
-- *********************************************************************************
select voters.name, voters.age, voters.city, candidates.name, candidates.party
from voters cross join candidates;


-- *********************************************************************************
-- Count the number of votes each candidate has received from the votes table, 
-- grouped by candidate
-- *********************************************************************************
-- Version 1: CROSS JOIN
-- =====================
select candidates.name, count(*) as vote_count
from votes, candidates 
where votes.candidateid = candidates.candidateid
group by candidates.name
order by vote_count desc;

-- Version 2: NATURAL JOIN
-- =======================
select candidates.name, count(*) as vote_count
from votes natural join candidates 
group by candidates.name
order by vote_count desc;

-- Version 3: INNER JOIN ON
-- ========================
select candidates.name, count(*) as vote_count
from votes inner join candidates 
     on votes.candidateid = candidates.candidateid
group by candidates.name
order by vote_count desc;

-- Version 4: INNER JOIN USING
-- ===========================
select candidates.name, count(*) as vote_count
from votes inner join candidates 
     using(candidateid)
group by candidates.name
order by vote_count desc;


/* *********************************************************************************
                                GROUP BY and HAVING ALL | ANY | SOME
   
   The GROUP BY clause in SQL is used to aggregate rows that have the same values in 
   specified columns into summary rows. 
   
   This allows us to perform aggregate functions (like COUNT, SUM, AVG, etc.) on 
   grouped data.
   
   The HAVING clause is used to filter groups created by the GROUP BY clause based on 
   specified conditions. It is similar to the WHERE clause, but while WHERE filters 
   rows before aggregation, HAVING filters groups after aggregation.
   
   The ALL keyword is used to compare a value to all values in a subquery 
   or a set of values.
   
   Alternatives to ALL: SOME, ANY (identical)

********************************************************************************* */


-- *********************************************************************************
-- Find the candidate(s) with the most votes
-- *********************************************************************************
-- Version 1:

select candidates.name, count(*) as vote_count
from votes natural join candidates 
group by candidates.name
order by vote_count desc
limit 1;


-- Version 2:
-- The HAVING clause is used to filter groups created by the GROUP BY
-- clause based on aggregate values. 

select candidates.name, count(*) as vote_count
from votes natural join candidates 
group by candidates.name
having (vote_count) >= all

   -- the subquery is formed here
   (select count(*)    
    from votes natural join candidates 
    group by candidates.name);
   



/* *********************************************************************************
                    Set operations: INTERSECT, UNION, EXCEPT
   
   The INTERSECT operation returns the common rows from two result sets. It is useful 
   when you want to identify records that exist in both datasets.
   
   The UNION operation combines the results of two or more queries into a single result 
   set. It removes duplicate rows by default.
   
   The EXCEPT operation returns rows from the first result set that do not appear in 
   the second result set.
   
   ALL vs DISTINCT options:
       ALL: Includes all records, retaining duplicates.
       DISTINCT: Ensures only unique records are returned. This is dafault behavior.

********************************************************************************* */

-- Find the names of voters who have voted for both Democratic and Republican candidates.

select voters.name
from voters join votes on voters.voterid = votes.voterid
            join candidates on votes.candidateid = candidates.candidateid
where candidates.party = 'Democratic'

intersect

select voters.name
from voters join votes on voters.voterid = votes.voterid
            join candidates on votes.candidateid = candidates.candidateid
where candidates.party = 'Republican';


-- find the names of voters who have voted for democratic but not republican candidates.

select voters.name
from voters join votes on voters.voterid = votes.voterid
            join candidates on votes.candidateid = candidates.candidateid
where candidates.party = 'Democratic'

except

select voters.name
from voters join votes on voters.voterid = votes.voterid
            join candidates on votes.candidateid = candidates.candidateid
where candidates.party = 'Republican';


