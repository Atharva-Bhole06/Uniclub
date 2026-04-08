-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: uniclub
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analytics`
--

DROP TABLE IF EXISTS `analytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total_users` int DEFAULT NULL,
  `total_clubs` int DEFAULT NULL,
  `total_events` int DEFAULT NULL,
  `total_attendance` int DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics`
--

LOCK TABLES `analytics` WRITE;
/*!40000 ALTER TABLE `analytics` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  `status` enum('present','absent') DEFAULT 'present',
  `marked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_session`
--

DROP TABLE IF EXISTS `attendance_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_session` (
  `id` varchar(255) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `event_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKh6r74u5gio7lcmb8msn9x0il0` (`event_id`),
  CONSTRAINT `FKh6r74u5gio7lcmb8msn9x0il0` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_session`
--

LOCK TABLES `attendance_session` WRITE;
/*!40000 ALTER TABLE `attendance_session` DISABLE KEYS */;
INSERT INTO `attendance_session` VALUES ('67824384-66bb-453f-86c3-83dd9eab563c','2026-04-08 10:22:55.805130',2),('716f426e-8b91-4af2-93d5-ce4fc620b349','2026-04-08 09:27:31.984130',2),('b50844d7-13bf-450c-9e71-ddff319c5471','2026-04-08 09:18:21.470976',2);
/*!40000 ALTER TABLE `attendance_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_session_custom_fields`
--

DROP TABLE IF EXISTS `attendance_session_custom_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_session_custom_fields` (
  `session_id` varchar(255) NOT NULL,
  `field_name` varchar(255) DEFAULT NULL,
  KEY `FK4se2pckhhrxn0m8m5gpctxxnq` (`session_id`),
  CONSTRAINT `FK4se2pckhhrxn0m8m5gpctxxnq` FOREIGN KEY (`session_id`) REFERENCES `attendance_session` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_session_custom_fields`
--

LOCK TABLES `attendance_session_custom_fields` WRITE;
/*!40000 ALTER TABLE `attendance_session_custom_fields` DISABLE KEYS */;
INSERT INTO `attendance_session_custom_fields` VALUES ('b50844d7-13bf-450c-9e71-ddff319c5471','Do you find the event simple?'),('b50844d7-13bf-450c-9e71-ddff319c5471','will you recommend this to another?'),('716f426e-8b91-4af2-93d5-ce4fc620b349','do you find the event understandable?'),('67824384-66bb-453f-86c3-83dd9eab563c','{\"question\":\"Did you find our event exciting?\",\"required\":true}');
/*!40000 ALTER TABLE `attendance_session_custom_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_submission`
--

DROP TABLE IF EXISTS `attendance_submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_submission` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `submitted_at` datetime(6) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  `division` varchar(255) DEFAULT NULL,
  `roll_no` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKrgtp9916xq3dou0fjqqtrpyqo` (`session_id`),
  KEY `FK3ca3bh6wmj0t6ydtsjdvdoskb` (`student_id`),
  CONSTRAINT `FK3ca3bh6wmj0t6ydtsjdvdoskb` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKrgtp9916xq3dou0fjqqtrpyqo` FOREIGN KEY (`session_id`) REFERENCES `attendance_session` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_submission`
--

LOCK TABLES `attendance_submission` WRITE;
/*!40000 ALTER TABLE `attendance_submission` DISABLE KEYS */;
INSERT INTO `attendance_submission` VALUES (1,'2026-04-08 09:27:14.463249','716f426e-8b91-4af2-93d5-ce4fc620b349',1,NULL,NULL),(2,'2026-04-08 10:22:19.754369','67824384-66bb-453f-86c3-83dd9eab563c',1,'A','45');
/*!40000 ALTER TABLE `attendance_submission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_submission_responses`
--

DROP TABLE IF EXISTS `attendance_submission_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_submission_responses` (
  `submission_id` bigint NOT NULL,
  `answer` varchar(1000) DEFAULT NULL,
  `question` varchar(255) NOT NULL,
  PRIMARY KEY (`submission_id`,`question`),
  CONSTRAINT `FKs1l3qbfhreyus2jcp445tvdcc` FOREIGN KEY (`submission_id`) REFERENCES `attendance_submission` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_submission_responses`
--

LOCK TABLES `attendance_submission_responses` WRITE;
/*!40000 ALTER TABLE `attendance_submission_responses` DISABLE KEYS */;
INSERT INTO `attendance_submission_responses` VALUES (1,'okay','do you find the event understandable?'),(2,'yes','Did you find our event exciting?');
/*!40000 ALTER TABLE `attendance_submission_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `club`
--

DROP TABLE IF EXISTS `club`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `head_id` int DEFAULT NULL,
  `faculty_id` int DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `website_link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKgsrapdj2pyoi3o3s5nodcah44` (`head_id`),
  KEY `FKm2kwblj3tsfgafs158q86ighe` (`faculty_id`),
  CONSTRAINT `FKm2kwblj3tsfgafs158q86ighe` FOREIGN KEY (`faculty_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKrjbhl3mehsa4432crh2pw10c4` FOREIGN KEY (`head_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club`
--

LOCK TABLES `club` WRITE;
/*!40000 ALTER TABLE `club` DISABLE KEYS */;
INSERT INTO `club` VALUES (1,NULL,'Show your talent.','Antarang',3,7,NULL,NULL),(2,NULL,'Make GitHub your Friend!','Github bros',4,6,'uploads/1775599030897_reference of head dashboard.png','https://www.meetup.com/');
/*!40000 ALTER TABLE `club` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `club_members`
--

DROP TABLE IF EXISTS `club_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `club_id` int DEFAULT NULL,
  `role` enum('member','core','head') DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `club_id` (`club_id`),
  CONSTRAINT `club_members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `club_members_ibfk_2` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club_members`
--

LOCK TABLES `club_members` WRITE;
/*!40000 ALTER TABLE `club_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `club_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `club_positions`
--

DROP TABLE IF EXISTS `club_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `club_positions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `club_id` int DEFAULT NULL,
  `position_name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `club_id` (`club_id`),
  CONSTRAINT `club_positions_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club_positions`
--

LOCK TABLES `club_positions` WRITE;
/*!40000 ALTER TABLE `club_positions` DISABLE KEYS */;
/*!40000 ALTER TABLE `club_positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clubs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `motto` text,
  `description` text,
  `logo` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `clubs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clubs`
--

LOCK TABLES `clubs` WRITE;
/*!40000 ALTER TABLE `clubs` DISABLE KEYS */;
/*!40000 ALTER TABLE `clubs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date` datetime(6) DEFAULT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `club_id` bigint DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `poster_url` varchar(255) DEFAULT NULL,
  `registration_link` varchar(255) DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `rejection_reason` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKge5xi5nf69096gtcjwjtup8wm` (`club_id`),
  KEY `FKlelt1nheas1gmn9t0nmc37a89` (`created_by`),
  CONSTRAINT `FKge5xi5nf69096gtcjwjtup8wm` FOREIGN KEY (`club_id`) REFERENCES `club` (`id`),
  CONSTRAINT `FKlelt1nheas1gmn9t0nmc37a89` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (1,NULL,'Explore AI-powered coding with GitHub Copilot. Learn how to write code faster, generate functions, and build real-world applications using AI-assisted development tools.','REJECTED','GitHub Copilot Dev Day',2,NULL,4,'2026-10-24 12:10:00.000000',NULL,'','2026-04-24 10:30:00.000000','Room 108',NULL),(2,NULL,'Explore AI-powered coding with GitHub Copilot. Learn how to write code faster, generate functions, and build real-world applications using AI-assisted development tools.','APPROVED','GitHub Copilot Dev Day',2,NULL,4,'2026-04-20 13:10:00.000000','uploads/1775593993072_event_ChatGPT Image Apr 8, 2026, 01_52_24 AM.png','','2026-04-20 10:30:00.000000','Room 108',NULL),(3,NULL,'asdfg','REJECTED','srg',2,NULL,4,'2026-10-20 13:26:00.000000',NULL,'','2026-10-20 10:35:00.000000','Room 108',NULL),(4,NULL,'ASD','APPROVED','asd',2,NULL,4,'2026-02-10 13:45:00.000000','uploads/1775604448049_event_reference of head dashboard.png','','2026-02-10 10:33:00.000000','asd',NULL);
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_gallery`
--

DROP TABLE IF EXISTS `event_gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_gallery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `event_gallery_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_gallery`
--

LOCK TABLES `event_gallery` WRITE;
/*!40000 ALTER TABLE `event_gallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_registrations`
--

DROP TABLE IF EXISTS `event_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `event_id` int DEFAULT NULL,
  `status` enum('registered','cancelled') DEFAULT 'registered',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`event_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_registrations`
--

LOCK TABLES `event_registrations` WRITE;
/*!40000 ALTER TABLE `event_registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_schedule`
--

DROP TABLE IF EXISTS `event_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `event_schedule_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  CONSTRAINT `event_schedule_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_schedule`
--

LOCK TABLES `event_schedule` WRITE;
/*!40000 ALTER TABLE `event_schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `club_id` int DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `description` text,
  `event_type` enum('technical','cultural','workshop','seminar') DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `club_id` (`club_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`),
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(150) DEFAULT NULL,
  `message` text,
  `club_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `club_id` (`club_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`),
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_verification`
--

DROP TABLE IF EXISTS `otp_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_verification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `expiry_time` datetime(6) DEFAULT NULL,
  `otp` varchar(255) DEFAULT NULL,
  `verified` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_verification`
--

LOCK TABLES `otp_verification` WRITE;
/*!40000 ALTER TABLE `otp_verification` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_tokens`
--

DROP TABLE IF EXISTS `qr_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `qr_tokens_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_tokens`
--

LOCK TABLES `qr_tokens` WRITE;
/*!40000 ALTER TABLE `qr_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `qr_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registration`
--

DROP TABLE IF EXISTS `registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `registered_at` datetime(6) DEFAULT NULL,
  `event_id` bigint DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcaj75dllh3lj3opj9sprf7fbb` (`user_id`,`event_id`),
  KEY `FKs4x1uat6i8fx26qpdrfwfg3ya` (`event_id`),
  CONSTRAINT `FKkyuphiynxwt1mtlfsptc991sc` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKs4x1uat6i8fx26qpdrfwfg3ya` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registration`
--

LOCK TABLES `registration` WRITE;
/*!40000 ALTER TABLE `registration` DISABLE KEYS */;
INSERT INTO `registration` VALUES (1,'2026-04-08 06:13:36.645608',2,1),(2,'2026-04-08 06:18:23.576727',2,8),(3,'2026-04-08 11:04:42.263621',2,9);
/*!40000 ALTER TABLE `registration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `notification_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `notification_id` (`notification_id`),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_notifications_ibfk_2` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `year` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `moodle_id` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Aarav Mehta','aarav@student.com','$2a$10$Cd6tSNlAnr7l67AVxiVlle8Nm67Q9emBSwwkZ6Abrh2.qszSwYAZ2','STUDENT','CS','FE',NULL,'MDL001',NULL,1,'2026-04-07 16:03:16'),(2,'Riya Sharma','riya@student.com','$2a$10$F7Z8VWuFSvLn6Lmq7tjFnOdanUGB5jZegC.vnsMZvqO3pXpX8ud2S','STUDENT','IT','SE',NULL,'MDL002',NULL,1,'2026-04-07 16:03:16'),(3,'Kabir Singh','kabir@student.com','$2a$10$z4jr41fDd49/s2.sEMMVku16Dg9RYL0eKSeg5VUEF2WnQQm1rBqiy','CLUB_HEAD','AIML','TE',NULL,'MDL003',NULL,1,'2026-04-07 16:03:16'),(4,'Ananya Patel','ananya@student.com','$2a$10$pS5cTHw1SZRK5qQzDnhpOO/Z0XfvikBbWXJHpz1u9g135zARxI8I6','CLUB_HEAD','AIDS','BE',NULL,'MDL004',NULL,1,'2026-04-07 16:03:16'),(5,'Dev Verma','dev@student.com','$2a$10$hJ40ZuootKFEd/O5ukOt9OhGIDE8NEqRR3v/qSTzApdcWGYoZlUo.','STUDENT','CS','SE',NULL,'MDL005',NULL,1,'2026-04-07 16:03:16'),(6,'Rajesh Kumar','rajesh@college.com','$2a$10$EzpgFr8X42zKChi8MyDdhOTMccJX3rZFOUNz8MnVAO/lGkZYxivxm','FACULTY',NULL,NULL,NULL,NULL,NULL,1,'2026-04-07 16:03:16'),(7,'Neha Iyer','neha@college.com','$2a$10$/ff1K.XNUnx1rgM3VYXuIuMWCIiIMiwjlTmiHiH3hKAokVXg9vfPu','FACULTY',NULL,NULL,NULL,NULL,NULL,1,'2026-04-07 16:03:16'),(8,'Atharva bhole','24104091@apsit.edu.in','$2a$10$WLcKwYzMhTe6hI0oeGJDref23k8foUE1z6tOknQyLbLyXzP0i7eqa','STUDENT','IT','SE',NULL,'24104091',NULL,1,'2026-04-07 16:05:21'),(9,'Atharva bhole','atharvabhole29@gmail.com','$2a$10$bc7SuTJPo3v8JlhRAOUQXuRC04B5PZu98pHulV3HTmKiWR7Ck8ciK','STUDENT','IT','SE',NULL,'24104091',NULL,1,'2026-04-08 05:34:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 11:26:35
