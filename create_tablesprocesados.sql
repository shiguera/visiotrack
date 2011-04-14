USE regatabis
DROP TABLE IF EXISTS dtosmangas;
CREATE TABLE dtosmangas
(
   id integer primary key auto_increment,
   idmanga integer,
   nombre varchar(250),
   fechainicio datetime,
   fechafin datetime
) engine=innodb;
insert into dtosmangas values (1,1001,'Manga 1','2011-04-18 12:00:00', '2011-04-18 14:00:00'),
	(2,1002,'Manga 2','2011-04-19 12:00:00', '2011-04-19 14:00:00');

drop table if exists marcasmangas;
create table marcasmangas 
(
    id integer primary key auto_increment,
    idmanga integer,
    num integer,
    cod char(12),
    urlicon varchar(250)
) engine=innodb;

	 
 
 
