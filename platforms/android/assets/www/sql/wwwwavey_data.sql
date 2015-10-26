create database wwwwavey_data;

use wwwwavey_data;

create table region (
	id int primary key not null auto_increment,
    name varchar(80) not null,
    country varchar(80) not null
);

create table spot (
    id int primary key not null auto_increment,
    name varchar(80) not null,
    regionId int not null,
    coord varchar(80) not null,
    webcamURL text not null
);

alter table spot add foreign key (regionId) references wwwwavey_data.region (
    id
) on delete cascade on update cascade;

create table users (
	id int primary key not null auto_increment,
	username varchar(80) not null,
	email varchar(255) not null,
	password_hash text not null,
	profilepic text not null
);

create table favourite (
	id int primary key not null auto_increment,
	userId int not null,
	spotId int not null
);

alter table favourite add foreign key (userId) references wwwwavey_data.users (
	id
) on delete cascade on update cascade;

alter table favourite add foreign key (spotId) references wwwwavey_data.spot (
	id
) on delete cascade on update cascade;

create table issues (
	id int primary key not null auto_increment,
	userId int not null,
	spotId int not null,
	airdata ENUM('Innacurate','Good') not null,
	seadata ENUM('Innacurate','Good') not null,
	cam ENUM('Down','Good') not null,
	resolved ENUM('true','false') not null default 'false',
	loggedTime TIMESTAMP default CURRENT_TIMESTAMP
);

alter table issues add foreign key (userId) references wwwwavey_data.users (
	id
) on delete cascade on update cascade;

alter table issues add foreign key (spotId) references wwwwavey_data.spot (
	id
) on delete cascade on update cascade;

DELIMITER //
 CREATE PROCEDURE AddRegion(IN regionName VARCHAR(80), IN regionCountry VARCHAR(80))
   BEGIN
   INSERT INTO region (name, country) VALUES (regionName, regionCountry);
   END //
 DELIMITER ;
 
 DELIMITER //
 CREATE PROCEDURE AddSpot(IN spotName VARCHAR(80), IN regionName VARCHAR(80), IN spotCoord VARCHAR(80), IN spotWebcamURL VARCHAR(80))
   BEGIN
   INSERT INTO spot (name, regionId, coord, webcamURL) VALUES (spotName, (select id from region where name = regionName), spotCoord, spotWebcamURL);
   END //
 DELIMITER ;
 
 /*DELIMITER //
CREATE PROCEDURE ReportIssue( IN _userId INT, IN _spotId INT, IN _airdata ENUM('true','false') , IN _seadata ENUM('true','false') , IN _cam ENUM('true','false'))
   BEGIN
   INSERT INTO issues( userId, spotId, airdata, seadata, cam ) 
   VALUES (_userId, _spotId, _airdata, _seadata, _cam);
   END //
 DELIMITER ;

 DELIMITER //
 CREATE PROCEDURE ResolveIssue(IN issueId INT)
   BEGIN
   UPDATE issues SET resolved = 'true', resolvedTime = CURRENT_TIMESTAMP
   WHERE id = issueId;
   END //
 DELIMITER ;
 
 DELIMITER //
 CREATE PROCEDURE UpdateIssue(IN issueId INT, IN issueDetails VARCHAR(255))
   BEGIN
   UPDATE issues SET details = issueDetails
   WHERE id = issueId;
   END //
 DELIMITER ;*/
  
 /* sample data*/
 
Call AddRegion('Western Cape', 'South Africa');
Call AddRegion('Eastern Cape', 'South Africa');
Call AddRegion('KwaZulu Natal', 'South Africa');

/* WESTERN CAPE */
 Call AddSpot('Big Bay', 'Western Cape', '-32.312794, 18.336365', 'http://www.wavescape.co.za/plugins/content/webcam/newfetch.php?pic=bigbay.jpg&rnd=1521616866');
 Call AddSpot('Elandsbaai', 'Western Cape', '-32.312794, 18.336365', '');
 Call AddSpot('Yzerfontein', 'Western Cape', '-33.360375, 18.154366', '');
 Call AddSpot('Melkbos', 'Western Cape', '-33.716563, 18.440679', 'http://www.wavescape.co.za/plugins/content/webcam/newfetch.php?pic=melkbos.jpg&rnd=1146710243');
 Call AddSpot('Blouberg', 'Western Cape', '-33.796396, 18.451789', '');
 Call AddSpot('Milnerton', 'Western Cape', '-33.866019, 18.485382', '');
 Call AddSpot('Llandudno', 'Western Cape', '-34.008105, 18.337986', '');
 Call AddSpot('Muizenberg', 'Western Cape', '-34.109224, 18.474025', 'http://www.wavescape.co.za/plugins/content/webcam/newfetch.php?pic=mbcorner.jpg&rnd=1760893942');
 Call AddSpot('Longbeach', 'Western Cape', '-34.136534, 18.329047', '');
 Call AddSpot('Kommetjie', 'Western Cape', '-34.138699, 18.305845', 'http://www.wavescape.co.za/plugins/content/webcam/newfetch.php?pic=3gkom.jpg&rnd=106548286');
 /* EASTERN CAPE */
 Call AddSpot('Jbay', 'Eastern Cape', '-34.070259, 24.925639', '');
 Call AddSpot('St Francis', 'Eastern Cape', '-34.196780, 24.868659', '');
 Call AddSpot('Mossel Bay', 'Eastern Cape', '-34.161568, 22.121883', '');
 /* KWAZULU NATAL */
 Call AddSpot('Umhlanga', 'KwaZulu Natal', '-29.737174, 31.088068', '');
 Call AddSpot('North Beach', 'KwaZulu Natal', '-29.849191, 31.039359', 'http://www.wavescape.co.za/plugins/content/webcam/newfetch.php?pic=newpier.jpg&rnd=952298436');