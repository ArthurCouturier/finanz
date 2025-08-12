import MealInterface from "@/interfaces/MealInterface";
import { useState, useEffect } from "react";
import MealDesktop from "./Desktop/MealDesktop";
import MealMobile from "./Mobile/MealMobile";

export default function Meal({
  editMode,
  name,
  meal,
  saveMeal,
}: {
  editMode: boolean;
  name: string;
  meal: MealInterface;
  saveMeal: (meal: MealInterface) => void;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? (
    <MealMobile
      editMode={editMode}
      name={name}
      meal={meal}
      saveMeal={saveMeal}
    />
  ) : (
    <MealDesktop
      editMode={editMode}
      name={name}
      meal={meal}
      saveMeal={saveMeal}
    />
  );
}
