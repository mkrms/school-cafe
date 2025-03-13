/*
  Warnings:

  - You are about to drop the `business_hours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `special_business_days` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "strapi_category_id" TEXT;

-- DropTable
DROP TABLE "business_hours";

-- DropTable
DROP TABLE "special_business_days";
