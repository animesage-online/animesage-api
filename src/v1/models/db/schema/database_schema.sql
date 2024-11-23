-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 22, 2024 at 06:42 PM
-- Server version: 10.5.24-MariaDB
-- PHP Version: 8.1.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `animesage_api_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `anime_data`
--

CREATE TABLE `anime_data` (
  `idAni` int(11) NOT NULL,
  `idMal` int(11) DEFAULT NULL,
  `idGogo` varchar(255) DEFAULT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `title_romaji` varchar(255) DEFAULT NULL,
  `genres` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `format` varchar(255) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `season` varchar(255) DEFAULT NULL,
  `studios` text DEFAULT NULL,
  `isAdult` tinyint(1) DEFAULT NULL,
  `nextAiringAt` int(11) DEFAULT NULL,
  `popularity` int(11) DEFAULT NULL,
  `animeData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`animeData`)),
  `countryOfOrigin` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `anime_episodes_data`
--

CREATE TABLE `anime_episodes_data` (
  `idAni` int(11) NOT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `title_romaji` varchar(255) DEFAULT NULL,
  `episodesData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`episodesData`))
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `anime_sync_info`
--

CREATE TABLE `anime_sync_info` (
  `idAni` int(11) NOT NULL,
  `idMal` int(11) DEFAULT NULL,
  `idGogo` varchar(255) DEFAULT NULL,
  `idGogoDub` varchar(255) DEFAULT NULL,
  `idZoro` varchar(255) DEFAULT NULL,
  `idPahe` varchar(255) DEFAULT NULL,
  `idNotifyMoe` varchar(255) DEFAULT NULL,
  `idAnimePlanet` varchar(255) DEFAULT NULL,
  `idKitsu` int(11) DEFAULT NULL,
  `idAnidb` int(11) DEFAULT NULL,
  `idLivechart` int(11) DEFAULT NULL,
  `idAnisearch` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `anime_to_refetch`
--

CREATE TABLE `anime_to_refetch` (
  `idAni` int(11) NOT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `title_romaji` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `nextAiringAt` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trending`
--

CREATE TABLE `trending` (
  `trending_no` int(11) NOT NULL,
  `idAni` int(11) DEFAULT NULL,
  `animeData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`animeData`))
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `weekly_schedule`
--

CREATE TABLE `weekly_schedule` (
  `idAni` int(11) NOT NULL,
  `idMal` int(11) DEFAULT NULL,
  `idGogo` varchar(255) DEFAULT NULL,
  `title_en` varchar(255) DEFAULT NULL,
  `title_romaji` varchar(255) DEFAULT NULL,
  `genres` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `format` varchar(255) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `season` varchar(255) DEFAULT NULL,
  `studios` text DEFAULT NULL,
  `isAdult` tinyint(1) DEFAULT NULL,
  `nextAiringAt` int(11) DEFAULT NULL,
  `weekStartInSeconds` int(11) DEFAULT NULL,
  `weekEndInSeconds` int(11) DEFAULT NULL,
  `animeData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`animeData`)),
  `countryOfOrigin` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `anime_data`
--
ALTER TABLE `anime_data`
  ADD PRIMARY KEY (`idAni`),
  ADD KEY `idMal` (`idMal`),
  ADD KEY `idGogo` (`idGogo`),
  ADD KEY `countryOfOrigin` (`countryOfOrigin`);
ALTER TABLE `anime_data` ADD FULLTEXT KEY `title_search_idx` (`title_en`,`title_romaji`);

--
-- Indexes for table `anime_episodes_data`
--
ALTER TABLE `anime_episodes_data`
  ADD PRIMARY KEY (`idAni`);

--
-- Indexes for table `anime_sync_info`
--
ALTER TABLE `anime_sync_info`
  ADD PRIMARY KEY (`idAni`),
  ADD KEY `idMal` (`idMal`),
  ADD KEY `idGogo` (`idGogo`),
  ADD KEY `idGogoDub` (`idGogoDub`),
  ADD KEY `idZoro` (`idZoro`),
  ADD KEY `idPahe` (`idPahe`),
  ADD KEY `idNotifyMoe` (`idNotifyMoe`),
  ADD KEY `idAnimePlanet` (`idAnimePlanet`),
  ADD KEY `idKitsu` (`idKitsu`),
  ADD KEY `idAnidb` (`idAnidb`),
  ADD KEY `idLivechart` (`idLivechart`),
  ADD KEY `idAnisearch` (`idAnisearch`);

--
-- Indexes for table `anime_to_refetch`
--
ALTER TABLE `anime_to_refetch`
  ADD PRIMARY KEY (`idAni`);

--
-- Indexes for table `trending`
--
ALTER TABLE `trending`
  ADD PRIMARY KEY (`trending_no`),
  ADD UNIQUE KEY `trending_no` (`trending_no`),
  ADD UNIQUE KEY `id` (`idAni`);

--
-- Indexes for table `weekly_schedule`
--
ALTER TABLE `weekly_schedule`
  ADD PRIMARY KEY (`idAni`),
  ADD KEY `idMal` (`idMal`),
  ADD KEY `idGogo` (`idGogo`),
  ADD KEY `countryOfOrigin` (`countryOfOrigin`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `trending`
--
ALTER TABLE `trending`
  MODIFY `trending_no` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `anime_data`
--
ALTER TABLE `anime_data`
  ADD CONSTRAINT `fk_anime_data_idAni` FOREIGN KEY (`idAni`) REFERENCES `anime_sync_info` (`idAni`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `anime_episodes_data`
--
ALTER TABLE `anime_episodes_data`
  ADD CONSTRAINT `fk_anime_episodes_data_idAni` FOREIGN KEY (`idAni`) REFERENCES `anime_sync_info` (`idAni`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `anime_to_refetch`
--
ALTER TABLE `anime_to_refetch`
  ADD CONSTRAINT `fk_anime_to_refetch_idAni` FOREIGN KEY (`idAni`) REFERENCES `anime_sync_info` (`idAni`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trending`
--
ALTER TABLE `trending`
  ADD CONSTRAINT `fk_trending_idAni` FOREIGN KEY (`idAni`) REFERENCES `anime_sync_info` (`idAni`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `weekly_schedule`
--
ALTER TABLE `weekly_schedule`
  ADD CONSTRAINT `fk_weekly_schedule_idAni` FOREIGN KEY (`idAni`) REFERENCES `anime_sync_info` (`idAni`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
