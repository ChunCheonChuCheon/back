/*
  Warnings:

  - The primary key for the `UserGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserGroup` table. All the data in the column will be lost.
  - Added the required column `price` to the `Dish` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Dish` ADD COLUMN `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `UserGroup` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`userId`, `groupId`);
