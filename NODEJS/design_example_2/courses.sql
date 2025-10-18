--************************************************
-- This is the only table the web app uses
--************************************************
create table courses (
    title        varchar(100)  CHECK(length(title) > 0),
    detail       varchar(1000) CHECK(length(detail) > 0),
    credits      integer       CHECK(credits > 0 and credits < 5),
    prereqs      varchar(100)  not null,
    attribute    varchar(20)   CHECK (attribute in ('Undergraduate', 'Graduate')));


--*********************************************************************
-- Course info comes from https://academiccatalog.sju.edu/courses/csc/
--*********************************************************************
insert into courses values('CSC 115 Intro to Computer Science', 
'A gentle introduction to computer science. Students will be introduced to basic programming constructs in a language such as Python. Open to all students. Computer science majors may take this course to prepare for CSC 120. This course presupposes no previous programming experience.',
3, 'None', 'Undergraduate');

insert into courses values('CSC 120 Computer Science I', 
'Computer programming for beginners. Very little prior knowledge regarding how computers work is assumed. Learn how to write understandable computer programs in a programming language widely used on the Internet. Go beyond the routine skills of a computer user and learn the programming fundamentals: data, variables, selection, loops, arrays, input-output, methods and parameter passing, object and classes, abstraction. Take what is learned and write programs for use on the Internet. One hour per week of the course is a required laboratory.',
4, 'None', 'Undergraduate');

insert into courses values('CSC 121 Computer Science II', 
'The course covers intermediate programming techniques emphasizing advanced object oriented techniques including inheritance, polymorphism, and interfaces. Other topics include recursion, exception handling, design patterns, simple GUI programming, and dynamic containers such as linked lists, stacks, queues, and trees.',
4, 'CSC120', 'Undergraduate');