-- Optional: the resource creates this table by itself on start.
CREATE TABLE IF NOT EXISTS `fks_animations` (
    `identifier` VARCHAR(64) NOT NULL,
    `favorites`  LONGTEXT NOT NULL,
    `shortcuts`  LONGTEXT NOT NULL,
    `recent`     LONGTEXT NOT NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
