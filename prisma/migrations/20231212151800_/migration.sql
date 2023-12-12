/*
  Warnings:

  - You are about to drop the column `loginId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `User` table. All the data in the column will be lost.
  - Added the required column `kakaoAccessToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kakaoRefreshToken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_loginId_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `loginId`,
    DROP COLUMN `password`,
    DROP COLUMN `salt`,
    ADD COLUMN `kakaoAccessToken` VARCHAR(191) NOT NULL,
    ADD COLUMN `kakaoRefreshToken` VARCHAR(191) NOT NULL;
