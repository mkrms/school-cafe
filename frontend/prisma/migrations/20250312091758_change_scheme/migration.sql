/*
  Warnings:

  - You are about to drop the column `menu_item_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the `menu_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menu_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `strapi_menu_id` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_category_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_menu_item_id_fkey";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "menu_item_id",
ADD COLUMN     "category_name" TEXT,
ADD COLUMN     "strapi_menu_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "menu_categories";

-- DropTable
DROP TABLE "menu_items";
