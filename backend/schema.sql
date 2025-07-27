-- Sets a variable called sql mode
-- i found this on the exported sql
-- from previous models. this was on
-- there so i kept it
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

START TRANSACTION; -- Starts a transaction

-- IMPORTANT!!
-- DROP TABLE `tags` FIRST BECAUSE MYSQL WILL ERROR ABOUT
-- DELETING THE OTHER 2 TABLES FIRST BECAUSE OF FOREIGN KEY
-- REFERENCING

-- Drops the tables only if they exists.
-- source: (expanded syntax level explaination)
-- DROP - Drops something. by DROP this means DELETE but for
-- non entry.
-- TABLE - A specific structure in SQL that contains data. each columns
-- have types.
-- IF - Conditional statement.
-- EXISTS - A condition. evaluates to the table existing in the current context.
-- `<tablename>` - The table name to drop if it exist.

DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `quiz_tags`;
DROP TABLE IF EXISTS `quizzes`

-- Creates a table named quizzes.
-- source: (esle)
-- CREATE - means to create something. Accepts another keyword to follow it to tell
-- mysql what to create.
-- TABLE - A table (explained earlier)
-- `<tablename>` - The name of the table to be created.
-- (...) - The schema for this table.
CREATE TABLE `quizzes` (
  -- this is the unique identifier that identifies a quiz.
  `id` BINARY(16) NOT NULL,

  -- this is the publisher of the quiz. kept for frontend to read.
  -- no api uses this yet... unless for filtering.
  `publisher` LONGTEXT NOT NULL,

  -- the title of the quiz
  `title` LONGTEXT NOT NULL,

  -- declares the primary key to be the field `id`
  PRIMARY KEY (`id`)
);
-- the ENGINE=InnoDB
-- sets the mysql engine to InnoDB
-- the charset is character set. (defines encoding in text)
-- the collate one defines the collate to be used in the
-- strings...
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 


CREATE TABLE `tags` (
  `id` BINARY(16) NOT NULL,

  -- Fits the reasonable range for words.
  -- not random because the longest word in english dictionary
  -- is 45 letters long.
  `name` VARCHAR(45) NOT NULL,

  -- ids for tags are unique.
  PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `quiz_tags` (
  -- these store binary(16) (which means 16 byte binary data)
  -- also for context, binary is a number system that uses only
  -- 1s and 0s to represent numbers.
  -- so 0 is 0, 1 is 1, but if you want to make other number,
  -- you add a unit called bits which is either a 1 or a 0,
  -- once you add enough bits, you can store numbers bigger than 1 or 0.
  -- note: for negative values, we use the last bit (in binary, the first bit is
  -- the one farthest to the left. in other words, in binary, we read from right to left.)
  -- and a byte is 8 bits, so in total, we have (8 * 16) bits to work with
  -- which is 128 bits in total. or about 340,282,366,920,938,463,463,374,607,431,768,211,456
  -- which is 340 undecillion in reading, so yeah... also this matters because this stores
  -- GUID (Globally Unique Identifier) / UUID
  -- (Universally Unique Identifier) for ids. so collision = near impossible
  -- so yeah. might be space inefficient... but in a real
  -- and big application, this is what is used so... i guess
  -- 286 bits per quiz tags ig.
  `id` BINARY(16) NOT NULL, -- this is the owner quiz's id
  `tag_id` BiNARY(16) NOT NULL, -- tag id is also... a guid...
  -- this means for each id:tag_id relation, there can be no
  -- other entries in which id_1===id_2 and tag_id_1===tag_id_2
  -- this means that all relations
   PRIMARY KEY (id, tag_id),
   FOREIGN KEY (id) REFERENCES quizzes(id) ON DELETE CASCADE,
   FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

COMMIT; -- Commits the transaction
