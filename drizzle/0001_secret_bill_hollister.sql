CREATE TABLE `artists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`spotifyId` varchar(128),
	`genres` text,
	`avgEnergy` varchar(10),
	`avgTempo` varchar(10),
	`avgValence` varchar(10),
	`avgDanceability` varchar(10),
	`avgAcousticness` varchar(10),
	`avgInstrumentalness` varchar(10),
	`popularity` int,
	`imageUrl` varchar(512),
	`spotifyUrl` varchar(512),
	`lastEnriched` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artists_id` PRIMARY KEY(`id`),
	CONSTRAINT `artists_spotifyId_unique` UNIQUE(`spotifyId`)
);
--> statement-breakpoint
CREATE TABLE `email_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weeklyDigest` int NOT NULL DEFAULT 1,
	`newEventAlerts` int NOT NULL DEFAULT 1,
	`lastEmailSent` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `event_artists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`artistId` int NOT NULL,
	`isPrimary` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_artists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(256),
	`artistName` varchar(256) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`eventTime` varchar(50),
	`description` text,
	`eventUrl` varchar(512),
	`imageUrl` varchar(512),
	`venue` varchar(256) DEFAULT 'Quai M',
	`isNew` int NOT NULL DEFAULT 1,
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `match_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`score` varchar(10) NOT NULL,
	`genreScore` varchar(10),
	`featureScore` varchar(10),
	`tag` enum('very_match','close','discovery','out_of_zone') NOT NULL,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `match_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `musical_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`genreDistribution` text NOT NULL,
	`avgEnergy` varchar(10),
	`avgTempo` varchar(10),
	`avgValence` varchar(10),
	`avgDanceability` varchar(10),
	`avgAcousticness` varchar(10),
	`avgInstrumentalness` varchar(10),
	`topArtists` text,
	`topGenres` text,
	`lastCalculated` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musical_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `musical_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `spotify_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`spotifyId` varchar(128) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`tokenExpiresAt` timestamp NOT NULL,
	`lastSynced` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `spotify_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `spotify_profiles_spotifyId_unique` UNIQUE(`spotifyId`)
);
--> statement-breakpoint
ALTER TABLE `email_preferences` ADD CONSTRAINT `email_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_artists` ADD CONSTRAINT `event_artists_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_artists` ADD CONSTRAINT `event_artists_artistId_artists_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artists`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_scores` ADD CONSTRAINT `match_scores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_scores` ADD CONSTRAINT `match_scores_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `musical_profiles` ADD CONSTRAINT `musical_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `spotify_profiles` ADD CONSTRAINT `spotify_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;