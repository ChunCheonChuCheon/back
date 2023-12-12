/*
  Warnings:

  - You are about to drop the column `kakaoAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `kakaoRefreshToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `kakaoAccessToken`,
    DROP COLUMN `kakaoRefreshToken`;
