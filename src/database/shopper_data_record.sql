CREATE DATABASE  IF NOT EXISTS `shopper` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `shopper`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: shopper
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `data_record`
--

DROP TABLE IF EXISTS `data_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_record` (
  `id` varchar(255) NOT NULL,
  `img` blob,
  `customer_code` varchar(255) DEFAULT NULL,
  `measure_datetime` datetime DEFAULT NULL,
  `measure_type` enum('WATER','GAS') DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `measure_value` decimal(15,2) DEFAULT NULL,
  `has_confirmed` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_record`
--

LOCK TABLES `data_record` WRITE;
/*!40000 ALTER TABLE `data_record` DISABLE KEYS */;
INSERT INTO `data_record` VALUES ('1',NULL,'1234','2024-08-27 10:30:00','GAS',NULL,NULL,NULL),('2',NULL,'1235','2024-08-27 10:30:00','WATER',NULL,NULL,NULL),('73c977c0-e3e5-4cde-8168-37c37d439226',_binary 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgEBAP/Dj5AAAAABJRU5Erk=','12345','2024-08-28 11:46:28','GAS','https://generativelanguage.googleapis.com/v1beta/files/x2sye94liyx6',78.00,1),('c0927580-37ce-4185-ba05-d3b9fbb03fef',_binary 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgEBAP/Dj5AAAAABJRU5Erk=','12345','2024-08-28 11:45:32','WATER','https://generativelanguage.googleapis.com/v1beta/files/qfwh6hhvrr18',78.00,NULL);
/*!40000 ALTER TABLE `data_record` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-28 18:12:42
