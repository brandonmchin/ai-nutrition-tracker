export interface User {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface NutritionGoal {
    id: string;
    userId: string;
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    cholesterolGoal?: number;
    sodiumGoal?: number;
    sugarGoal?: number;
    vitaminAGoal?: number;
    vitaminCGoal?: number;
    vitaminDGoal?: number;
    calciumGoal?: number;
    ironGoal?: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface FoodEntry {
    id: string;
    foodLogId: string;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    cholesterol?: number;
    sodium?: number;
    sugar?: number;
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    calcium?: number;
    iron?: number;
    mealType?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface FoodLog {
    id: string;
    userId: string;
    date: string;
    entries: FoodEntry[];
    createdAt: string;
    updatedAt: string;
  }