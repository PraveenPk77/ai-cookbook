"use client";
import { useEffect, useState } from "react";
import { getRecipesFromFirestore } from "@/lib/getRecipesFromFirestore";

export default function RecipeList() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      const data = await getRecipesFromFirestore();
      setRecipes(data);
      setLoading(false);
    }
    fetchRecipes();
  }, []);

  if (loading) return <p className="text-muted">Loading recipes...</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="p-4 border rounded-xl shadow-sm">
          <h3 className="text-lg font-bold">{recipe.title}</h3>
          <p className="text-sm text-muted-foreground">{recipe.ingredients}</p>
        </div>
      ))}
    </div>
  );
}
