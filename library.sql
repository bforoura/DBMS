/* ******************************************************************
   Library Model
   
   patrons checkout books
   books have authors
   
	+-----------------------+
	|       patrons         |
	+-----------------------+
	| patron_id (PK)        |
	| name                  |
	| membership_date       |
	| email (Unique)        |
	+-----------------------+
********************************************************************** */
create table if not exists patrons (
    patron_id int,
    name varchar(100), 
    membership_date date,
    email varchar(100),
    
    constraint PK_constraint primary key(patron_id),
    constraint UQ_constraint unique(email)   
);


insert into patrons (patron_id, name, membership_date, email) values
(1, 'Alice Johnson', '2023-01-15', 'alice.johnson@example.com'),
(2, 'Bob Smith', '2022-11-30', 'bob.smith@example.com'),
(3, 'Charlie Davis', '2024-02-20', 'charlie.davis@example.com'),
(4, 'Diana Green', '2023-06-10', 'diana.green@example.com'),
(5, 'Emily White', '2024-03-05', 'emily.white@example.com'),
(6, 'Frank Harris', '2022-09-25', 'frank.harris@example.com'),
(7, 'Grace Lee', '2023-04-18', 'grace.lee@example.com'),
(8, 'Henry Walker', '2024-05-10', 'henry.walker@example.com'),
(9, 'Ivy Brown', '2024-01-08', 'ivy.brown@example.com'),
(10, 'Jack Miller', '2024-07-12', 'jack.miller@example.com');

desc patrons;
select * from patrons;


/* ******************************************************************
	+--------------------------+
	|         authors          |
	+--------------------------+
	| author_id (PK)           |
	| name                     |
	| birth_year               |
	| nationality              |
	+--------------------------+
********************************************************************* */
create table if not exists authors (
    author_id int primary key,
    name varchar(100),
    birth_year int,
    nationality varchar(50)
);


insert into authors (author_id, name, birth_year, nationality) values
(1, 'George Orwell', 1903, 'British'),
(2, 'J.K. Rowling', 1965, 'British'),
(3, 'J.R.R. Tolkien', 1892, 'British'),
(4, 'Harper Lee', 1926, 'American'),
(5, 'F. Scott Fitzgerald', 1896, 'American'),
(6, 'Stephen King', 1947, 'American'),
(7, 'Agatha Christie', 1890, 'British'),
(8, 'Mark Twain', 1835, 'American'),
(9, 'Jane Austen', 1775, 'British'),
(10, 'Isaac Asimov', 1920, 'American');


desc authors;
select * from authors;



/* ******************************************************************
   +--------------------------+               +-------------------------+
   |         authors          |               |         books           |
   +--------------------------+               +-------------------------+
   | author_id (PK)           |<--------------| author_id (FK)          |
   | name                     |               | book_id (PK)            |
   | birth_year               |               | title                   |
   | nationality              |               | published_year          |
   +--------------------------+               | genre                   |
                                              +-------------------------+
                                          
********************************************************************** */
create table if not exists books (
    book_id int primary key,
    title varchar(100),
    
    author_id int,    -- FK
    
    published_year int,
    genre varchar(50),
    
    foreign key (author_id) references authors(author_id)
);

insert into books (book_id, title, author_id, published_year, genre) values
(1, '1984', 1, 1949, 'Dystopian'),
(2, 'Harry Potter and the Sorcerer\'s Stone', 2, 1997, 'Fantasy'),
(3, 'The Hobbit', 3, 1937, 'Fantasy'),
(4, 'To Kill a Mockingbird', 4, 1960, 'Fiction'),
(5, 'The Great Gatsby', 5, 1925, 'Classic'),
(6, 'It', 6, 1986, 'Horror'),
(7, 'Murder on the Orient Express', 7, 1934, 'Mystery'),
(8, 'The Adventures of Tom Sawyer', 8, 1876, 'Adventure'),
(9, 'Pride and Prejudice', 9, 1813, 'Romance'),
(10, 'Foundation', 10, 1951, 'Science Fiction'),
(11, 'Carrie', 6, 1974, 'Horror'),
(12, 'The Catcher in the Rye', 5, 1951, 'Fiction'),
(13, 'Sense and Sensibility', 9, 1811, 'Romance'),
(14, 'The Shining', 6, 1977, 'Horror'),
(15, 'The Hound of the Baskervilles', 7, 1902, 'Mystery');




/* ******************************************************************
   Composite Primary Key (book_id, patron_id, checkout_date) has 
      book_id: Identifies the book being checked out.
      patron_id: Identifies the patron who checked out the book.
      checkout_date: The date on which the book was checked out.

   Together, these columns uniquely identify each checkout event. 
   
	+--------------------------+
	|        checkout          |
	+--------------------------+
	| book_id (FK, PK)         |<----------------+
	| patron_id (FK, PK)       |                 |
	| checkout_date (PK)       |                 |
	| return_date              |                 |
	+--------------------------+                 |
						     |
						     |
			+----------------------------+ 
			|                            |
	+--------------------------+     +--------------------------+
	|         books            |     |         patrons          |
	+--------------------------+     +--------------------------+
	| book_id (PK)             |     | patron_id (PK)           |
	| title                    |     | name                     |
	| author_id (FK)           |     | membership_date          |
	| published_year           |     | email                    |
	| genre                    |     +--------------------------+
	+--------------------------+

********************************************************************* */
create table if not exists checkout (

    -- PK's of the partcipating strong entity sets
    book_id int,
    patron_id int,
    
    -- descriptive attributes
    checkout_date date,
    return_date date,
   
    --- the composite PK ensures that there are no duplicate entries for a 
    --  book checked out by the same patron on the same date.
    -- 
    --  similar to: unique (book_id, patron_id, checkout_date)
    primary key (book_id, patron_id, checkout_date),

    
    -- Referential integrity is enforced through foreign key constraints.
    foreign key (book_id) references books(book_id),
    foreign key (patron_id) references patrons(patron_id)
);

insert into checkout (book_id, patron_id, checkout_date, return_date) values
(1, 1, '2024-08-01', '2024-08-15'),
(2, 2, '2024-08-05', NULL),
(3, 3, '2024-07-20', '2024-08-10'),
(4, 4, '2024-07-25', NULL),
(5, 5, '2024-08-10', '2024-08-20'),
(6, 6, '2024-08-12', NULL),
(7, 7, '2024-08-15', '2024-08-30'),
(8, 8, '2024-07-10', '2024-07-20'),
(9, 9, '2024-08-05', NULL),
(10, 10, '2024-08-01', '2024-08-18'),
(11, 1, '2024-06-01', NULL),
(12, 2, '2024-05-15', '2024-06-01'),
(13, 3, '2024-05-10', '2024-05-25'),
(14, 4, '2024-04-20', NULL),
(15, 5, '2024-03-01', '2024-03-15');





-- ********************************************************************************
-- Query 1: Determine the year with the highest number of patrons who joined.
-- ********************************************************************************
select year(membership_date), count(*)
from patrons
group by year(membership_date)
order by count(*) desc
limit 1;



-- ********************************************************************************
-- Query 2: List count of authors by nationality.
-- ********************************************************************************
select nationality, count(*)
from authors
group by nationality
order by count(*);



-- ********************************************************************************
-- Query 3: Count #books checked out by each patron for books published after 1950.
-- ********************************************************************************
select patrons.name, count(checkout.book_id) as books_checked_out
from patrons, checkout, books
where checkout.book_id = books.book_id
  and patrons.patron_id = checkout.patron_id
  and books.published_year > 1950

group by patrons.patron_id, patrons.name
order by books_checked_out desc;



-- ********************************************************************************
-- Query 4: List all related combinations of authors and books
-- ********************************************************************************
select authors.name, books.title
from authors, books
where authors.author_id = books.author_id
order by authors.name, books.title;




-- ********************************************************************************
-- Query 5: List all related combinations of books and patrons for a specific book 
--          genre
-- ********************************************************************************
select books.title, patrons.name
from books, patrons
where books.genre = 'Fantasy'
order by books.title, patrons.name;



-- ********************************************************************************
-- Query 6: List all books and patrons sorted by checkout dates and grouped by book 
--          title
-- ********************************************************************************
select books.title, patrons.name, checkout.checkout_date
from books, patrons, checkout
where books.book_id = checkout.book_id
  and patrons.patron_id = checkout.patron_id
order by books.title, checkout.checkout_date;



-- ********************************************************************************
-- Query 7: List patrons who have checked out Fantasy books between 
--          '2024-01-01' and '2024-08-31'. Print both patrons names and book titles.
-- ********************************************************************************

-- Version 1: no aliasing
--------------------------
select books.title, patrons.name, checkout.checkout_date
from books, patrons, checkout
where books.book_id = checkout.book_id
  and patrons.patron_id = checkout.patron_id
  and books.genre = 'Fantasy'
  and checkout.checkout_date between '2024-01-01' and '2024-08-31'
order by books.title, checkout.checkout_date;


-- version 2: declare variables
--------------------------
set @genre = 'Fantasy';
set @start_date = '2024-01-01';
set @end_date = '2024-08-31';

-- use the variables in the query
select books.title, patrons.name, checkout.checkout_date
from books, patrons, checkout
where books.book_id = checkout.book_id
  and patrons.patron_id = checkout.patron_id
  and books.genre = @genre
  and checkout.checkout_date between @start_date and @end_date
order by books.title, checkout.checkout_date;


-- Version 3: aliasing
--------------------------
select b.title, p.name, c.checkout_date
from books as b, checkout as c, patrons as p
where b.book_id = c.book_id
  and p.patron_id = c.patron_id
  and b.genre = 'Fantasy'
  and c.checkout_date between '2024-01-01' and '2024-08-31'
order by b.title, c.checkout_date;



-- ********************************************************************************
-- Query 8: Create a view that shows all books checked out by patrons, including the 
--          book title, patron name, checkout date, and the genre of the book.
-- ********************************************************************************

create view booksCheckedOut as (
select b.title as book_title, 
       p.name as patron_name, 
       c.checkout_date, 
       b.genre
from books as b, checkout as c, patrons as p
where b.book_id = c.book_id
  and p.patron_id = c.patron_id
  and b.genre = 'Fantasy'
  and c.checkout_date between '2024-01-01' and '2024-08-31'
order by b.title, c.checkout_date);


select * from booksCheckedOut;


-- ********************************************************************************
-- Query 9: Counts the number of books checked out by each patron.
-- ********************************************************************************
select patron_name, count(book_title) as number_of_books_checked_out
from booksCheckedOut
group by patron_name
order by number_of_books_checked_out desc;



-- ********************************************************************************
-- Query 10: List books and checkout dates for a specific patron
-- ********************************************************************************
select book_title, checkout_date
from booksCheckedOut
where patron_name = 'Alice Johnson'
order by checkout_date;




