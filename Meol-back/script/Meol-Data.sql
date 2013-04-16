-- phpMyAdmin SQL Dump
-- version 3.3.2deb1ubuntu1
-- http://www.phpmyadmin.net
--
-- Serveur: localhost
-- Généré le : Mar 16 Avril 2013 à 16:10
-- Version du serveur: 5.1.62
-- Version de PHP: 5.3.2-1ubuntu4.17

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données: `Meol-Data`
--

-- --------------------------------------------------------

--
-- Structure de la table `Collection`
--

CREATE TABLE IF NOT EXISTS `Collection` (
  `id` int(11) NOT NULL,
  `nom` varchar(250) NOT NULL,
  `description` text NOT NULL,
  `logo` varchar(250) NOT NULL,
  `type` varchar(250) NOT NULL,
  `full_hierarchy` text NOT NULL,
  `level` int(11) NOT NULL,
  `ordre` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `Collection_Items`
--

CREATE TABLE IF NOT EXISTS `Collection_Items` (
  `fk_collection` int(11) NOT NULL,
  `fk_taxon` int(11) NOT NULL,
  `object_id` int(11) NOT NULL,
  `fk_image` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `Object_image`
--

CREATE TABLE IF NOT EXISTS `Object_image` (
  `objectid` varchar(250) NOT NULL,
  `identifier` varchar(250) NOT NULL,
  `title` varchar(250) NOT NULL,
  `licence` text NOT NULL,
  `rights` text NOT NULL,
  `credit` text NOT NULL,
  `description` text NOT NULL,
  `mimeType` varchar(250) NOT NULL,
  `filename` varchar(500) NOT NULL,
  `URL` varchar(500) NOT NULL,
  `taxonId` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `fk_collection` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `Object_text`
--

CREATE TABLE IF NOT EXISTS `Object_text` (
  `objectid` varchar(250) NOT NULL,
  `identifier` varchar(250) NOT NULL,
  `title` varchar(250) NOT NULL,
  `licence` text NOT NULL,
  `rights` text NOT NULL,
  `credit` text NOT NULL,
  `description` text NOT NULL,
  `taxonId` int(11) NOT NULL,
  `type` varchar(250) NOT NULL,
  `fk_collection` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `Taxon`
--

CREATE TABLE IF NOT EXISTS `Taxon` (
  `pageid` int(11) NOT NULL,
  `taxonConceptId` int(11) NOT NULL,
  `taxonName` varchar(500) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `flathierarchy` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `terminal` int(11) NOT NULL,
  `common_name_prefered` varchar(550) NOT NULL,
  `common_name` text NOT NULL,
  `fk_collection` int(11) NOT NULL,
  `fk_text` varchar(500) NOT NULL,
  `fk_image` varchar(500) NOT NULL,
  `fk_iucn` varchar(500) NOT NULL,
  `iNat` text NOT NULL,
  `weightIUCN` int(11) DEFAULT NULL,
  `weightContinent` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
