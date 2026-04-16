/**
 * MACROSCOPE PERFORMANCE OS - FOOD DATABASE SERVICE
 * Handles food search and nutritional data
 */

import * as api from '../api';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

class FoodDatabaseService {
  /**
   * Search food database directly against Supabase
   */
  async searchFood(query: string): Promise<FoodItem[]> {
    if (!query) return [];
    try {
      const data = await api.searchFoods(query);

      return (data || []).map((item: any) => ({
      id: item.id,
      name: item.food_name,
      calories: item.energy_kcal,
      protein: item.protein_g,
      carbs: item.carb_g,
      fat: item.fat_g,
      serving: '100g', // Generic portion base used in the reference data
    }));
    } catch (error) {
      console.error('Error searching foods:', error);
      return [];
    }
  }

  /**
   * Get specific food item directly from Supabase
   */
  async getFoodById(id: string): Promise<FoodItem | null> {
    try {
      const data: any = await api.getFoodById(id);
      if (!data) return null;
      return {
        id: data.id,
        name: data.food_name,
        calories: data.energy_kcal,
        protein: data.protein_g,
        carbs: data.carb_g,
        fat: data.fat_g,
        serving: '100g',
      };
    } catch {
      return null;
    }

  }
}

export const foodDatabaseService = new FoodDatabaseService();
