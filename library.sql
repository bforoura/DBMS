/* ****************************************************************************************
The library database model consists of several tables that allow for tracking of 
library operations, such as borrowing and author contributions:

   -- patrons(patron_id, name, membership_date, email)
              ---------
   -- checkout(book_id, patron_id, checkout_date, return_date)
               -------  ---------
   -- authors(author_id, name, birth_year, nationality)
              ---------
   -- genres(genre_id, genre_name, desciption, popuarity_rating)
             --------
   -- books(book_id, title, published_year, genre_id)
            --------                        --------
   -- authors_books(author_id, book_id)
                    ---------  -------
   
 Assumptions
 ===========  
   -- patrons maintains a unique list of library members
   -- authors contains information about book authors
   -- each author can write multiple books, hence a one-to-many relationship between 
      authors and books. 
   
   -- books details about each book and includes a foreign key referencing 
      the genres table which categorizes books into different genres. 
       
   -- checkout creates a many-to-many relationship between patrons and books, as each 
      patron can check  out multiple books, and a book can be checked out by multiple 
      patrons over time. 
       
   -- authors_books allows the mapping of multiple authors to a single book, supporting 
      a many-to-many relationship. 
    
**************************************************************************************** */
-- ========
-- PATRONS
-- ========
create table if not exists patrons (
    patron_id int primary key,
    
    name varchar(100) not null,
    membership_date date,
    email varchar(100) unique not null
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


-- ========
-- AUTHORS
-- ========
create table if not exists authors (
    author_id int primary key,
    
    name varchar(100) not null,
    birth_year int check (birth_year >= 0),
    nationality varchar(50) not null
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



-- ========
-- GENRES
-- ========
create table if not exists genres (
    genre_id int primary key,
    
    genre_name varchar(50) not null unique,
    
    description varchar(255),
    popularity_rating int
);



insert into genres (genre_id, genre_name, description, popularity_rating) values
(1, 'Dystopian', 'Fiction exploring social and political structures in a dark, controlled society.', 8),
(2, 'Fantasy', 'A genre that features magical elements and fantastical worlds.', 9),
(3, 'Fiction', 'Literature created from the imagination, not based strictly on fact.', 10),
(4, 'Classic', 'Works that have stood the test of time and are widely recognized for their literary merit.', 7),
(5, 'Horror', 'Fiction intended to scare, unsettle, or horrify the reader.', 8),
(6, 'Mystery', 'A genre centered around the solution of a crime or unraveling a puzzle.', 8),
(7, 'Adventure', 'Stories that feature exciting journeys and exploration.', 9),
(8, 'Romance', 'Fiction that focuses on romantic relationships between characters.', 9),
(9, 'Science Fiction', 'Fiction dealing with imaginative and futuristic concepts, such as advanced science and technology.', 8),
(10, 'Historical Fiction', 'Fiction that dramatizes historical events or periods, blending factual history with imaginative storytelling.', 7);

-- ========
-- BOOKS
-- ========
create table if not exists books (
    book_id int primary key,
    
    title varchar(100) not null,
    author_id int,      -- FK
    published_year int check (published_year >= 0),
    genre_id int,       -- FK
    
    foreign key (author_id) references authors(author_id),
    foreign key (genre_id) references genres(genre_id)
);

insert into books (book_id, title, author_id, published_year, genre_id) values
(1, '1984', 1, 1949, 1),
(2, 'Harry Potter and the Sorcerer\'s Stone', 2, 1997, 2),
(3, 'The Hobbit', 3, 1937, 2),
(4, 'To Kill a Mockingbird', 4, 1960, 3),
(5, 'The Great Gatsby', 5, 1925, 4),
(6, 'It', 6, 1986, 5),
(7, 'Murder on the Orient Express', 7, 1934, 6),
(8, 'The Adventures of Tom Sawyer', 8, 1876, 7),
(9, 'Pride and Prejudice', 9, 1813, 8),
(10, 'Foundation', 10, 1951, 9),
(11, 'Carrie', 6, 1974, 5),
(12, 'The Catcher in the Rye', 5, 1951, 3),
(13, 'Sense and Sensibility', 9, 1811, 8),
(14, 'The Shining', 6, 1977, 5),
(15, 'The Hound of the Baskervilles', 7, 1902, 6);



-- ========
-- CHECKOUT
-- ======== 
create table if not exists checkout (
    book_id int,     -- FK
    patron_id int,   -- FK
    
    checkout_date date not null,
    return_date date,
    
    -- same as unique(book_id, patron_id, checkout_date),
    primary key (book_id, patron_id, checkout_date),
    
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


-- =============
-- AUTHORS_BOOKS
-- =============
create table if not exists authors_books (
    author_id int,
    book_id int,
    primary key (author_id, book_id),
    
    foreign key (author_id) references authors(author_id),
    foreign key (book_id) references books(book_id)
);

insert into authors_books (author_id, book_id) values
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);


/* *******************************************************************************
   Query 1. List all books with their authors (use aliases)
   
      -- patrons(patron_id, name, membership_date, email)
      -- checkout(book_id, patron_id, checkout_date, return_date)
      -- authors(author_id, name, birth_year, nationality)
      -- genres(genre_id, genre_name, desciption, popuarity_rating)
      
      -- books(book_id, title, published_year, genre_id)        NEEDED FOR JOIN
      -- authors_books(author_id, book_id)                      NEEDED FOR JOIN
      
******************************************************************************** */
select b.title, a.name as author_name
from books b inner join authors a 
	on b.author_id = a.author_id;




/* *******************************************************************************
   Query 2. Count the number of books per genre
   
      -- patrons(patron_id, name, membership_date, email)
      -- checkout(book_id, patron_id, checkout_date, return_date)
      -- authors(author_id, name, birth_year, nationality)
      -- authors_books(author_id, book_id) 
      
      -- books(book_id, title, published_year, genre_id)              NEEDED FOR JOIN
      --genres(genre_id, genre_name, desciption, popuarity_rating)    NEEDED FOR JOIN   
      
******************************************************************************* */
-- ==========
-- no aliases
-- ==========
select genres.genre_name, count(books.book_id)
from books inner join genres 
    on books.genre_id = genres.genre_id
group by genres.genre_name;


-- =======
-- aliases
-- =======
select g.genre_name, count(b.book_id) as book_count
from books b inner join genres g 
     on b.genre_id = g.genre_id
group by g.genre_name;





/* *******************************************************************************
   Query 3. List patrons who have checked out books

      -- patrons(patron_id, name, membership_date, email)           NEEDED FOR JOIN
      -- checkout(book_id, patron_id, checkout_date, return_date)   NEEDED FOR JOIN
      
      -- authors(author_id, name, birth_year, nationality)
      -- authors_books(author_id, book_id) 
      -- books(book_id, title, published_year, genre_id)        
      -- genres(genre_id, genre_name, desciption, popuarity_rating)                         
      
******************************************************************************** */
-- DISTINCT keyword ensures that each patron's name appears only once in the result, 
-- even if they have checked out multiple books.

select distinct patrons.name
from patrons inner join checkout  
	on patrons.patron_id = checkout.patron_id;




/* *******************************************************************************
   Query 4. List all patrons who have checked out at least one book

       -- The EXISTS clause checks if there is at least one corresponding entry in 
          the checkout table for each patron. 
       
       -- If a patron has checked out a book, the subquery will return a result, 
          and the patron's name will be included in the output. 
          
          
       -- EXISTS can be more efficient for filtering results. If you only need to check 
          for the existence of rows rather than retrieve data from multiple tables, 
          EXISTS may result in faster query performance.

       -- If you're working with subqueries that return a large dataset, using EXISTS 
          can reduce the amount of data processed because it stops evaluating as soon 
          as it finds a match.
      
******************************************************************************** */
select name
from patrons
where exists (
    select *
    from checkout
    where checkout.patron_id = patrons.patron_id
);



/* *******************************************************************************
                       [LEFT | RIGHT | FULL] OUTER JOIN
    
    1) A LEFT JOIN is a type of join in SQL that retrieves all records from the left 
       table and the matched records from the right table. 
    
       If there is no match, the result will still include all records from the 
       left table, but the columns from the right table will contain NULL values.
    
    2) A RIGHT JOIN retrieves all records from the right table and the matched records 
       from the left table. 
    
       If there is no match, the result will include all records from the right table 
       with NULL values for the columns from the left table.
    
    3) A FULL JOIN combines the results of both LEFT JOIN and RIGHT JOIN.
    
 
 patrons
+-----------+-----------------+
| patron_id | name            |
+-----------+-----------------+
|     1     | Alice Johnson   |
|     2     | Bob Smith       |
|     3     | Charlie Davis   |
+-----------+-----------------+

checkout
+---------+-----------+----------------+
| book_id | patron_id | checkout_date  |
+---------+-----------+----------------+
|   101   |     1     | 2024-08-01     |
|   102   |     1     | 2024-08-05     |
|   103   |     2     | 2024-08-10     |
+---------+-----------+----------------+

SELECT p.name, c.book_id, c.checkout_date
FROM patrons p
LEFT OUTER JOIN checkout c ON p.patron_id = c.patron_id;

+-----------------+---------+----------------+
| name            | book_id | checkout_date  |
+-----------------+---------+----------------+
| Alice Johnson    |   101   | 2024-08-01    |
| Alice Johnson    |   102   | 2024-08-05    |
| Bob Smith        |   103   | 2024-08-10    |
| Charlie Davis    |  NULL   | NULL          |
+-----------------+---------+----------------+

NOTES on LEFT JOIN
=================
1) Alice Johnson appears twice because she has two checkouts.
2) Bob Smith appears once because he has one checkout.
3) Charlie Davis is included even though he has no checkouts, 
   with NULL values for book_id and checkout_date.
4) The LEFT OUTER JOIN includes all patrons, regardless of whether 
   they have checked out any books.
5) The keyword OUTER is optional.



authors
+-----------+-----------------+
| author_id | name            |
+-----------+-----------------+
|     1     | George Orwell    |
|     2     | J.K. Rowling     |
|     3     | J.R.R. Tolkien   |
|     4     | Harper Lee       |
+-----------+-----------------+

books
+---------+------------------------------+-----------+
| book_id | title                        | author_id |
+---------+------------------------------+-----------+
|   101   | 1984                                  |     1     |
|   102   | Harry Potter and the Sorcerer's Stone |     2     |
|   103   | The Hobbit                            |     3     |
|   104   | To Kill a Mockingbird                 |   NULL    |
|   105   | The Catcher in the Rye                |     4     |
+---------+------------------------------+-----------+


SELECT b.title, a.name AS author_name
FROM books b
RIGHT JOIN authors a ON b.author_id = a.author_id;

+--------------------------------------+-----------------+
| title                                | author_name     |
+--------------------------------------+-----------------+
| 1984                                 | George Orwell    |
| Harry Potter and the Sorcerer's Stone| J.K. Rowling     |
| The Hobbit                           | J.R.R. Tolkien   |
| NULL                                 | Harper Lee       |
+--------------------------------------+-----------------+


NOTES on RIGHT JOIN
===================
1) George Orwell, J.K. Rowling, and J.R.R. Tolkien appear with their respective books.
2) Harper Lee appears with a NULL title because there is no corresponding book with 
author_id 4 in the books table.



SUMMARY
=======
1) Both joins can serve different purposes based on your focus. 
2) If you want to highlight authors and ensure all are included even if they haven't 
   authored books, use a LEFT JOIN. 
3) If you want to ensure all books are displayed, regardless of whether they have 
authors, use a RIGHT JOIN.

******************************************************************************* */


/* *******************************************************************************
    Query 5. Find the number of checkouts for each book.
    
    A NATURAL JOIN here will only return books that have been checked out, 
    meaning any books with no corresponding records in the checkout table will be 
    excluded. 
    
    If you need to include all books, you should stick with a LEFT JOIN.
******************************************************************************* */
select books.title, count(checkout.book_id) as checkout_count
from books left outer join checkout
     on books.book_id = checkout.book_id
group by books.title;




-- *******************************************************************************
-- Query 6. List authors who have written more than 2 books
-- *******************************************************************************
select authors.name, count(books.book_id)
from authors inner join books 
     on authors.author_id = books.author_id
group by authors.name
having count(books.book_id) > 2;




-- *******************************************************************************
-- Query 7. List patrons and the number of books they have checked out
-- *******************************************************************************
select patrons.name, count(checkout.book_id)
from patrons inner join checkout 
     on patrons.patron_id = checkout.patron_id
group by patrons.name;



/* *******************************************************************************
   Query 8. Find genres with no books
   
   A LEFT JOIN means that all records from the genres table will be included in 
   the result set, along with matching records from the books table. 
   
   If there is no match, the result will include NULL for the books columns.
******************************************************************************* */
-- =========
-- Version 1
-- =========
select genres.genre_name
from genres left join books 
     on genres.genre_id = books.genre_id
where books.book_id is null;



-- =========
-- Version 2
-- =========
--  creates the complete list of genres available in the database
select genre_name from genres

except

-- retrieves genre names that have at least one associated book
select genres.genre_name 
from genres
   join books on genres.genre_id = books.genre_id;
   
   

-- =========
-- Version 3
-- =========
select genre_name
from genres
where not exists (
    select *
    from books
    where genres.genre_id = books.genre_id
);


/* *******************************************************************************
   Query 8. List the most popular genre (most checked out books)
   
      -- patrons(patron_id, name, membership_date, email)           
      
      -- checkout(book_id, patron_id, checkout_date, return_date)   NEEDED FOR JOIN
      -- books(book_id, title, published_year, genre_id)            NEEDED FOR JOIN
      -- genres(genre_id, genre_name)                               NEEDED FOR JOIN
      
      -- authors(author_id, name, birth_year, nationality)
      -- authors_books(author_id, book_id) 
                          
      
******************************************************************************* */
-- ======================
-- Version 1: using limit
-- ======================
select genres.genre_name, count(checkout.book_id)
from genres
     inner join books on genres.genre_id = books.genre_id
     inner join checkout on books.book_id = checkout.book_id
group by genres.genre_name
order by count(checkout.book_id) desc
limit 1;


-- ==========================
-- Version 2: having() >= all
-- ==========================
select genres.genre_name, count(checkout.book_id)
from genres
     inner join books on genres.genre_id = books.genre_id
     inner join checkout on books.book_id = checkout.book_id
group by genres.genre_name
having count(checkout.book_id) >= all (
    select count(checkout.book_id)
    from genres
    inner join books on genres.genre_id = books.genre_id
    inner join checkout on books.book_id = checkout.book_id
    group by genres.genre_name
);


-- =========================================
-- Version 3: using having() = and as subquery 
-- =========================================
select genres.genre_name, count(checkout.book_id)
from genres
     inner join books on genres.genre_id = books.genre_id
     inner join checkout on books.book_id = checkout.book_id
group by genres.genre_name

-- The subquery part is used to create a derived table, 
-- allowing us to refer to the result of the inner query
having count(checkout.book_id) = (
    select max(checkout_count)
    from (
        select count(checkout.book_id) as checkout_count
        from genres
             inner join books on genres.genre_id = books.genre_id
             inner join checkout on books.book_id = checkout.book_id
        group by genres.genre_name
    ) AS subquery
);



/* *******************************************************************************
   Query 9. Find patrons who have checked out more than 3 books
******************************************************************************* */
select p.name, count(c.book_id) as checkout_count
from patrons p inner join checkout c 
     on p.patron_id = c.patron_id
group by p.name
having count(c.book_id) > 3;




/* *******************************************************************************
   Query 10: Find the top 5 patrons with the most books checked out by genre
   
   1) We need to join patrons, checkout, books, and genres to get the number 
      of checkouts by each patron for each genre.

   2) We then group the results by patron and genre, counting the number of 
      books checked out and ordering the results to show the top 5 patrons.
******************************************************************************* */
select p.name as patron_name, g.genre_name, count(c.book_id) as checkout_count
from patrons p
   inner join checkout c on p.patron_id = c.patron_id
   inner join books b on c.book_id = b.book_id
   inner join genres g on b.genre_id = g.genre_id
group by p.name, g.genre_name
order by checkout_count desc
limit 5;




/* ************************************************************************************
   Query 11: Find authors whose books have an average checkout count >= 1, 
             along with the average checkout count per book
  
   1) Join authors and books, then use a subquery to count the number of checkouts 
      for each book.

   2) groups the results by author and calculate the average checkout count per book, 
      filtering to show only authors whose books have an average checkout count above 3.
**************************************************************************************** */
select a.name as author_name, avg(bc.checkout_count) as average_checkout_count
from authors a
inner join books b on a.author_id = b.author_id
inner join (
    select book_id, count(*) as checkout_count
    from checkout
    group by book_id
) as bc on b.book_id = bc.book_id
group by a.name
having avg(bc.checkout_count) >= 1
order by average_checkout_count desc;





/* ************************************************************************************
   Query 12: Who are the patrons who have checked out the most books from genres 
   that are considered "popular," based on a defined popularity threshold.


      -- patrons(patron_id, name, membership_date, email)           NEEDED FOR JOIN    
      -- checkout(book_id, patron_id, checkout_date, return_date)   NEEDED FOR JOIN
      -- books(book_id, title, published_year, genre_id)            NEEDED FOR JOIN
      -- genres(genre_id, genre_name, desciption, popuarity_rating) NEEDED FOR JOIN 
      -- authors(author_id, name, birth_year, nationality)          NEEDED FOR JOIN
      -- authors_books(author_id, book_id)                          NEEDED FOR JOIN
      
      
**************************************************************************************** */
set @popularity_threshold = 5;      -- Set your desired popularity threshold

select 
    patrons.name as patron_name,
    count(checkout.book_id) as total_checkouts
from 
    patrons
join 
    checkout on patrons.patron_id = checkout.patron_id
join 
    books on checkout.book_id = books.book_id
join 
    genres on books.genre_id = genres.genre_id
where 
    genres.popularity_rating >= @popularity_threshold
group by 
    patrons.patron_id
having 
    total_checkouts >= (
        select max(checkout_count)
        from (
            select count(checkout.book_id) as checkout_count
            from checkout
            join books on checkout.book_id = books.book_id
            join genres on books.genre_id = genres.genre_id
            where genres.popularity_rating >= @popularity_threshold
            group by checkout.patron_id
        ) as avg_checkouts
    )
order by 
    total_checkouts desc;
    


/* *********************************************************************************
                       Common Table Expression (CTE)  vs. Views

  CTE
  ====
    A CTE is defined within the scope of a single query and exists only 
    for the duration of that query. It uses the "WITH ... AS" format.
    
    Once the query finishes executing, the CTE is no longer available.

    CTEs can make complex queries more readable and maintainable by breaking them 
    into logical subqueries.

 VIEW
 ====
    A view is a stored (but not materialized in MySQL) query in the database that 
    can be reused in multiple queries. 
    
    It acts like a virtual table and persists until explicitly dropped.

    Once created, views can be queried just like regular tables, making them useful 
    for encapsulating complex logic or security restrictions.
 
************************************************************************************* */ 





/* ************************************************************************************
   Query 13: Who are the patrons who have checked out the most books from genres 
   that are considered "popular," based on a defined popularity threshold.
   
   Use CTEs this time.
************************************************************************************ */
set @popularity_threshold = 8;  -- Set your desired popularity threshold

-- This CTE calculates the total checkouts for each patron who has checked 
-- out books from popular genres.
with popular_checkouts as (
    select 
        checkout.patron_id, count(checkout.book_id) as total_checkouts
    from 
        checkout
    join 
        books on checkout.book_id = books.book_id
    join 
        genres on books.genre_id = genres.genre_id
    where 
        genres.popularity_rating >= @popularity_threshold
    group by 
        checkout.patron_id
),

-- This CTE finds the maximum number of checkouts from the popular_checkouts CTE.
max_checkouts as (
    select 
        max(total_checkouts) as max_checkout_count
    from 
        popular_checkouts
)

-- main
select 
    patrons.name as patron_name,
    popular_checkouts.total_checkouts
from 
    patrons
join 
    popular_checkouts on patrons.patron_id = popular_checkouts.patron_id
join 
    max_checkouts on popular_checkouts.total_checkouts >= max_checkouts.max_checkout_count
order by 
    popular_checkouts.total_checkouts desc;
    

 
 
/* ************************************************************************************ 
                            The SQL CASE statement 
                            
   -- It allows for conditional logic within queries, enabling users to return different 
      values based on specific conditions. 
      
   -- It can be structured in two main formats
      -- The simple CASE compares a single expression against multiple values:
      
		      select 
			  name,
			  case membership_level
			      when 'basic' then 'Standard Member'
			      when 'premium' then 'Premium Member'
			      else 'Unknown Membership'
			  end as membership_type
		      from patrons;


      -- The searched CASE evaluates a series of Boolean conditions:
 
			 select 
			     title,
			     case 
				 when return_date is not null then 'returned'
				 when return_date is null and checkout_date < curdate() then 'overdue'
				 else 'currently checked out'
			     end as checkout_status
			from checkout;


   -- Each CASE statement consists of WHEN clauses to define conditions, THEN clauses 
      to specify the results, and an optional ELSE clause for handling unmatched conditions. 
      
       

************************************************************************************ */



/* *****************************************************************************************
   Query 14: Find out which of the checked-out books are "Returned", "Currently Checked Out" 
   or "Overdue"
   
      -- patrons(patron_id, name, membership_date, email)           NEEDED FOR JOIN
      -- checkout(book_id, patron_id, checkout_date, return_date)   NEEDED FOR JOIN
      -- books(book_id, title, published_year, genre_id)            NEEDED FOR JOIN
      
      -- authors(author_id, name, birth_year, nationality)
      -- genres(genre_id, genre_name, desciption, popuarity_rating)
      -- authors_books(author_id, book_id)                    
      
***************************************************************************************** */
select 
    b.title,
    p.name,
    c.checkout_date,
    c.return_date,
    case 
        when c.return_date is not null then 'returned'
        when c.return_date is null and c.checkout_date < curdate() then 'overdue'
        else 'currently checked out'
    end as checkout_status
from 
    checkout c
join 
    books b on c.book_id = b.book_id
join 
    patrons p on c.patron_id = p.patron_id;

