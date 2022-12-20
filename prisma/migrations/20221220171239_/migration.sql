/*
  Warnings:

  - You are about to drop the column `referalUrl` on the `ReferralLink` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[referralUrl]` on the table `ReferralLink` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referralUrl` to the `ReferralLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReferralLink" DROP COLUMN "referalUrl";
ALTER TABLE "ReferralLink" ADD COLUMN     "referralUrl" STRING NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ReferralLink_referralUrl_key" ON "ReferralLink"("referralUrl");
