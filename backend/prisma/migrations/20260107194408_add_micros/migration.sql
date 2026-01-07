-- AlterTable
ALTER TABLE "FoodEntry" ADD COLUMN     "cholesterol" DOUBLE PRECISION,
ADD COLUMN     "sodium" DOUBLE PRECISION,
ADD COLUMN     "sugar" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "NutritionGoal" ADD COLUMN     "cholesterolGoal" DOUBLE PRECISION,
ADD COLUMN     "sodiumGoal" DOUBLE PRECISION,
ADD COLUMN     "sugarGoal" DOUBLE PRECISION;
