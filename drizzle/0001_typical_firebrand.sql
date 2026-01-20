CREATE TABLE `holdings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`symbol` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`assetType` enum('stock','fund','crypto') NOT NULL,
	`quantity` varchar(100) NOT NULL,
	`purchasePrice` varchar(100) NOT NULL,
	`purchaseDate` timestamp NOT NULL,
	`currentPrice` varchar(100),
	`lastUpdated` timestamp DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holdings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portfolioId` int NOT NULL,
	`totalValue` varchar(100) NOT NULL,
	`totalCost` varchar(100) NOT NULL,
	`totalReturn` varchar(100) NOT NULL,
	`returnPercentage` varchar(100) NOT NULL,
	`volatility` varchar(100),
	`date` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolioMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`holdingId` int NOT NULL,
	`symbol` varchar(50) NOT NULL,
	`price` varchar(100) NOT NULL,
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `holdings` ADD CONSTRAINT `holdings_portfolioId_portfolios_id_fk` FOREIGN KEY (`portfolioId`) REFERENCES `portfolios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolioMetrics` ADD CONSTRAINT `portfolioMetrics_portfolioId_portfolios_id_fk` FOREIGN KEY (`portfolioId`) REFERENCES `portfolios`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `priceHistory` ADD CONSTRAINT `priceHistory_holdingId_holdings_id_fk` FOREIGN KEY (`holdingId`) REFERENCES `holdings`(`id`) ON DELETE cascade ON UPDATE no action;