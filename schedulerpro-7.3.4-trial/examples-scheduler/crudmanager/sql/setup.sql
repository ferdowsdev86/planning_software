SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

SET FOREIGN_KEY_CHECKS=0;

drop table IF EXISTS `assignments`;
drop table IF EXISTS `resources`;
drop table IF EXISTS `dependencies`;
drop table IF EXISTS `events`;
drop table IF EXISTS `time_ranges`;
drop table IF EXISTS `resource_time_ranges`;
drop table IF EXISTS `options`;

create TABLE IF NOT EXISTS `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(511) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `duration` float unsigned DEFAULT NULL,
  `durationUnit` varchar(255) DEFAULT 'day',
  `cls` varchar(255) DEFAULT NULL,
  `iconCls` varchar(255) DEFAULT NULL,
  `eventColor` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

create TABLE IF NOT EXISTS `dependencies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from` int DEFAULT NULL,
  `to` int DEFAULT NULL,
  `fromSide` varchar(10) DEFAULT 'right',
  `toSide` varchar(10) DEFAULT 'left',
  `cls` varchar(255) DEFAULT NULL,
  `lag` float DEFAULT 0,
  `lagUnit` varchar(255) DEFAULT 'day',
  PRIMARY KEY (`id`),
  INDEX (`from`),
  CONSTRAINT `fk_dependencies_from_event` FOREIGN KEY (`from`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  INDEX (`to`),
  CONSTRAINT `fk_dependencies_to_event` FOREIGN KEY (`to`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=1;

create TABLE IF NOT EXISTS `resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `eventColor` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

create TABLE IF NOT EXISTS `assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eventId` int NOT NULL,
  `resourceId` int NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`eventId`),
  CONSTRAINT `fk_assignments_events` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  INDEX (`resourceId`),
  CONSTRAINT `fk_assignments_resources` FOREIGN KEY (`resourceId`) REFERENCES `resources`(`id`) ON DELETE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=1;

create TABLE IF NOT EXISTS `time_ranges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `cls` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=INNODB AUTO_INCREMENT=1;

create TABLE IF NOT EXISTS `resource_time_ranges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resourceId` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `cls` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`),
  INDEX (`resourceId`),
  CONSTRAINT `fk_resource_time_ranges_resources` FOREIGN KEY (`resourceId`) REFERENCES `resources`(`id`) ON DELETE CASCADE
) ENGINE=INNODB AUTO_INCREMENT=1;

create TABLE IF NOT EXISTS `options` (
  `name` varchar(45) NOT NULL,
  `value` varchar(255) DEFAULT NULL,
  `dt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=INNODB DEFAULT CHARSET=latin1;


-- region=data

SET FOREIGN_KEY_CHECKS=0;

truncate table `dependencies`;
truncate table `assignments`;
truncate table `resources`;
truncate table `events`;
truncate table `options`;
truncate table `time_ranges`;
truncate table `resource_time_ranges`;

-- region=insertions

insert into `dependencies` (`id`, `from`, `to`, `fromSide`, `toSide`) VALUES
(1, 2, 4, 'end', 'start'),
(2, 7, 8, 'end', 'start'),
(3, 14, 15, 'end', 'top'),
(4, 18, 19, 'end', 'start'),
(5, 1, 20, 'end', 'start'),
(6, 9, 10, 'bottom', 'start');

insert into `assignments` (`eventId`, `resourceId`) VALUES
(1, 12),
(2, 1),
(3, 1),
(4, 1),
(5, 2),
(6, 3),
(7, 4),
(8, 4),
(9, 5),
(10, 5),
(11, 6),
(12, 7),
(13, 8),
(14, 9),
(15, 9),
(16, 10),
(17, 11),
(18, 11),
(19, 11),
(20, 12),
(21, 12);

insert into `resources` (`id`, `name`, `eventColor`) VALUES
(1, 'Team Sam', 'pink'),
(2, 'Team Dave', 'indigo'),
(3, 'Team Omar', 'violet'),
(4, 'Team Makena', 'pink'),
(5, 'Team Maya', 'pink'),
(6, 'Team Kai', 'indigo'),
(7, 'Team Nora', 'pink'),
(8, 'Team John', 'violet'),
(9, 'Team Olivia', 'pink'),
(10, 'Team Noah', 'violet'),
(11, 'Team Isla', 'violet'),
(12,'Team Jabari', 'pink');

insert into `events` (`id`, `name`, `description`, `startDate`, `endDate`, `duration`, `eventColor`) VALUES
( 1, 'Analyze outcome', 'Accuracy of the predication based on the reworked GPT-4 output', '2023-01-30', '2023-02-04', 5, 'deep-orange' ),
( 2, 'Investigate feasibility', 'Determine if it is a risk worth taking, market readiness', '2023-01-30', '2023-02-04', 5, 'indigo' ),
( 3, 'Plan implementation', 'Make a very detailed plan, to satisfy requirements', '2023-02-03', '2023-02-09', 6, 'pink' ),
( 4, 'Consider implications', 'Take all known factors into consideration, critical or not', '2023-02-08', '2023-02-13', 5, 'violet' ),
( 5, 'Plan preparations', 'What to prepare, when to prepare it, who is responsible', '2023-01-31', '2023-02-07', 7, 'pink' ),
( 6, 'Investigate implementability', 'Is it possible, considerations of risk, cost or effort aside', '2023-01-30', '2023-02-06', 7, 'indigo' ),
( 7, 'Consider risks', 'A risky undertaking, leave no risk unconsidered', '2023-02-01', '2023-02-08', 7, 'violet' ),
( 8, 'Plan risk reduction', 'To have the least effect on the tight schedule, as outlined by management', '2023-02-13', '2023-02-18', 5, 'pink' ),
( 9, 'Investigate structure', 'Efficiency, responsibility, size, reports, analyse all factors', '2023-01-30', '2023-02-03', 4, 'indigo' ),
( 10, 'Investigate analysts', 'Time spent on analysis seems to be dropping', '2023-02-02', '2023-02-11', 9, 'indigo' ),
( 11, 'Consider analysing', 'Unknown factors needs to be known, to not lack in knowledge', '2023-01-31', '2023-02-07', 7, 'violet' ),
( 12, 'Plan considerations', 'When and how to consider what, well documented', '2023-02-03', '2023-02-09', 6, 'pink' ),
( 13, 'Implement plan', '☑ Consider, ☑ Analyse, ☑ Investigate', '2023-01-30', '2023-02-10', 11, 'blue' ),
( 14, 'Investigate risks', 'Before analysing, investigate thoroughly', '2023-01-30', '2023-02-04', 5, 'indigo' ),
( 15, 'Analyze risks', 'Will the investigated risks affect the considerations', '2023-02-03', '2023-02-11', 8, 'deep-orange' ),
( 16, 'Investigate organization', 'Teams, management, projects', '2023-01-31', '2023-02-06', 6, 'indigo' ),
( 17, 'Investigate documentation', 'Does it cover all risks, considerations and investigations', '2023-02-05', '2023-02-12', 7, 'indigo' ),
( 18, 'Implement documentation', 'After proper research and investigation, write some docs', '2023-01-30', '2023-02-04', 5, 'blue' ),
( 19, 'Plan retirement', 'Analysts burned out, investigators retiring', '2023-02-06', '2023-02-13', 7, 'pink' ),
( 20, 'Implement considerations', 'Guaranteeing not having to consider them again', '2023-02-05', '2023-02-10', 5, 'blue' ),
( 21, 'Implement solution', 'One solution to rule them all, deprecating previous solutions', '2023-02-14', '2023-02-19', 5, 'blue' );

-- region=options
insert into `options` (`name`, `value`) VALUES
('revision', '1');
-- endregion=options

insert into `time_ranges` (`id`, `name`, `startDate`, `endDate`) VALUES
(1, 'Sprint start', '2023-01-30', null),
(2, 'Remote team-building', '2023-02-07', '2023-02-10');

insert into `resource_time_ranges` (`id`, `resourceId`, `name`, `startDate`, `endDate`) VALUES
(1, 3, 'Recuperation', '2023-02-10', '2023-02-17'),
(2, 7, 'Long weekend', '2023-02-15', '2023-02-20');

-- endregion=insertions

SET FOREIGN_KEY_CHECKS=1;

-- endregion=data

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
