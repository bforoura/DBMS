/* ******************************************************************
   This command disables the safe updates mode. When SQL_SAFE_UPDATES 
   is set to 1 (which is the default for many MySQL installations), 
   MySQL restricts UPDATE and DELETE operations to ensure that they 
   include a WHERE clause that uses a key column, preventing accidental 
   updates or deletions of large amounts of data.  
   
   By setting SQL_SAFE_UPDATES to 0, you allow UPDATE and DELETE 
   statements to run without these restrictions. This can be useful for 
   running broad updates or deletes but requires caution to avoid 
   unintended data loss.
  
   E.G. UPDATE employees SET salary = salary * 1.1; 
   
   This would fail if SQL_SAFE_UPDATES=1, because it lacks a WHERE clause.

************************************************************************** */
set SQL_SAFE_UPDATES=1;



/* ******************************************************************
   This command disables foreign key constraint checks. Foreign key 
   constraints ensure that the relationships between tables are maintained, 
   meaning that operations like INSERT, UPDATE, or DELETE will be checked 
   to ensure that they do not violate the referential integrity of the 
   database. 
  
   By setting FOREIGN_KEY_CHECKS to 0, you can perform operations that would 
   normally be restricted by these constraints, such as deleting records that 
   are referenced by foreign keys. After performing such operations, it is good 
   practice to re-enable foreign key checks with SET FOREIGN_KEY_CHECKS=1; 
   to restore normal database integrity checks.
  
   SAFE PRACTICE:
        SET FOREIGN_KEY_CHECKS=0;
            Perform operations that might otherwise violate foreign key constraints
        SET FOREIGN_KEY_CHECKS=1;
************************************************************************** */
set FOREIGN_KEY_CHECKS=1;




-- *******************************************************************
-- After running this command, "examples" becomes the current database
-- *******************************************************************
use examples;




/* ****************************************************************************
   Primary Key vs. Unique Key
   ****************************************************************************
   
   1) A table can have only one PRIMARY KEY, but it can have multiple UNIQUE 
      constraints. 
   2) The PRIMARY KEY is also used as the main identifier for rows in the table.
   3) PRIMARY KEY cannot be NULL, whereas UNIQUE columns can contain NULL values.
   4) Both constraints create unique indexes, but the PRIMARY KEY index is often  
      more instrumental to the table's structure.
      
	+--------------------------+
	|        take              |
	+--------------------------+
	| sid (FK)                 |<----------------+
	| cid (FK)                 |                 |             
	+--------------------------+                 |

	+--------------------------+     +--------------------------+
	|         courses          |     |         students         |
	+--------------------------+     +--------------------------+
	| cid (PK)                 |     | sid (PK)                 |
	| title                    |     | name                     |
	|                          |     | email (UQ)               |
	+--------------------------+     +--------------------------+
	
**************************************************************************** */
create table if not exists students (
    sid int,
    name varchar(100),
    email varchar(100),
    
    constraint PK_constraint primary key(sid),
    constraint UQ_constraint unique(email)   
);

   -- table modifications, if need be
   --    alter table students drop constraint PK_constraint;
   --    alter table students drop constraint UQ_constraint;

insert into students (sid, name, email) values
(1, 'Alice', 'alice@example.com'),
(2, 'Bob',  'bob@example.com');


-- **********************************
create table if not exists courses (
    cid int primary key,
    title varchar(100) 
);

insert into courses (cid, title) values
(100, 'CSC 281'),
(200, 'MAT 271');


-- **********************************
create table if not exists take (
    sid int,    -- FK
    cid int,    -- FK
    
    -- one-to-one mapping
    -- unique(sid),
    -- unique(cid),
    
    -- avoid duplicate (sid,cid) combinations
    -- many-to-many by default
    -- unique(sid,cid),
 
 
    -- When you set ON DELETE/UPDATE CASCADE for a foreign key constraint, it means that 
    -- if a row in the parent table is deleted/updated, then all corresponding rows in 
    -- the child table will also be automatically deleted/updated. 
    
    -- This helps maintain referential integrity by ensuring that there are no orphaned 
    -- rows in the child table.
    
    foreign key(sid) references students(sid) on delete cascade,
    foreign key(cid) references courses(cid) on delete cascade  
);

insert into take (sid, cid) values
(1, 100),     -- Alice is taking CSC 281
(1, 200),     -- Alice is taking MAT 271
(2, 100),     -- Bob is taking CSC 281
(2, 200);     -- Bob is taking MAT 271

