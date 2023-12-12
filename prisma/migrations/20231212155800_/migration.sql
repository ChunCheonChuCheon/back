/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserDish` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Group` DROP FOREIGN KEY `Group_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `UserCategory` DROP FOREIGN KEY `UserCategory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserDish` DROP FOREIGN KEY `UserDish_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserGroup` DROP FOREIGN KEY `UserGroup_userId_fkey`;

-- AlterTable
ALTER TABLE `Group` MODIFY `adminId` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `UserCategory` DROP PRIMARY KEY,
    MODIFY `userId` BIGINT NOT NULL,
    ADD PRIMARY KEY (`userId`, `categoryId`);

-- AlterTable
ALTER TABLE `UserDish` DROP PRIMARY KEY,
    MODIFY `userId` BIGINT NOT NULL,
    ADD PRIMARY KEY (`userId`, `dishId`);

-- AlterTable
ALTER TABLE `UserGroup` DROP PRIMARY KEY,
    MODIFY `userId` BIGINT NOT NULL,
    ADD PRIMARY KEY (`userId`, `groupId`);

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserGroup` ADD CONSTRAINT `UserGroup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDish` ADD CONSTRAINT `UserDish_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserCategory` ADD CONSTRAINT `UserCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
