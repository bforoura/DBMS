/* *****************************************************************************************
-- when set, it prevents potentially dangerous updates and deletes
set SQL_SAFE_UPDATES=0;

-- when set, it disables the enforcement of foreign key constraints.
set FOREIGN_KEY_CHECKS=0;

-- controls the amount of time (in seconds) that MySQL will wait for a 
-- client (e.g., a connection) to send data before it closes the connection.
SET GLOBAL wait_timeout = 28800;  -- 8 hours

-- it sets the maximum time MySQL will wait to read data from a client 
-- or network before giving up
SET GLOBAL net_read_timeout = 600; -- 10 minutes
**************************************************************************************** */
-- The DB where the accounts table is created
use indexing;




-- Create the accounts table
CREATE TABLE accounts (
  account_num CHAR(5) PRIMARY KEY,    -- 5-digit account number (e.g., 00001, 00002, ...)
  branch_name VARCHAR(50),            -- Branch name (e.g., Brighton, Downtown, etc.)
  balance DECIMAL(10, 2),             -- Account balance, with two decimal places (e.g., 1000.50)
  account_type VARCHAR(50)            -- Type of the account (e.g., Savings, Checking)
);



/* ***************************************************************************************************
The procedure generates 10,000 records for the accounts table, with the account_num padded to 5 digits.
branch_name is randomly selected from one of the six predefined branches.
balance is generated randomly, between 0 and 100,000, rounded to two decimal places.
***************************************************************************************************** */
-- Change delimiter to allow semicolons inside the procedure
DELIMITER $$

CREATE PROCEDURE generate_accounts()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE branch_name VARCHAR(50);
  DECLARE account_type VARCHAR(50);
  
  -- Loop to generate 10,000 account records
  WHILE i <= 10000 DO
    -- Randomly select a branch from the list of branches
    SET branch_name = ELT(FLOOR(1 + (RAND() * 6)), 'Brighton', 'Downtown', 'Mianus', 'Perryridge', 'Redwood', 'RoundHill');
    
    -- Randomly select an account type
    SET account_type = ELT(FLOOR(1 + (RAND() * 2)), 'Savings', 'Checking');
    
    -- Insert account record
    INSERT INTO accounts (account_num, branch_name, balance, account_type)
    VALUES (
      LPAD(i, 5, '0'),                   -- Account number as just digits, padded to 5 digits (e.g., 00001, 00002, ...)
      branch_name,                       -- Randomly selected branch name
      ROUND((RAND() * 100000), 2),       -- Random balance between 0 and 100,000, rounded to 2 decimal places
      account_type                        -- Randomly selected account type (Savings/Checking)
    );

    SET i = i + 1;
  END WHILE;
END$$

-- Reset the delimiter back to the default semicolon
DELIMITER ;

-- ******************************************************************
-- execute the procedure
-- ******************************************************************

CALL generate_accounts();

delete from accounts;
select count(*) from accounts;

select * from accounts limit 10;


-- ******************************************************************
SHOW INDEXES from accounts;
-- ******************************************************************


-- ****************************************************************************************
-- This type of index will speed up queries that filter or search by the branch_name column.
-- *****************************************************************************************
CREATE INDEX idx_branch_name ON accounts (branch_name);
-- DROP INDEX idx_branch_name ON accounts;

SELECT count(*) FROM accounts WHERE branch_name = 'Downtown';




-- ****************************************************************************************
-- If you frequently run queries that filter or sort by both branch_name and account_type, 
-- creating a composite index on these two columns can improve performance.
-- ****************************************************************************************
CREATE INDEX idx_branch_account_type ON accounts (branch_name, account_type);
-- DROP INDEX idx_branch_account_type ON accounts;

SELECT count(*) FROM accounts 
WHERE branch_name = 'Downtown' 
AND account_type = 'Savings';


-- ****************************************************************************************
-- The EXPLAIN statement shows how MySQL executes a query and whether it is using indexes 
-- to find rows efficiently. By running EXPLAIN before and after creating an index, you can 
-- see whether the query plan changes and whether the index is being used.
-- ****************************************************************************************
EXPLAIN SELECT count(*) FROM accounts 
WHERE branch_name = 'Downtown'
AND account_type = 'Savings';


