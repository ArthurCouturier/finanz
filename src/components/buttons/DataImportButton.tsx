import HouseConfigService from "@/services/configurations/HouseConfigService";
import RestaurantConfigService from "@/services/configurations/RestaurantConfigService";
import TjmConfigService from "@/services/configurations/TjmConfigService";
import { useRef, ChangeEvent } from "react";
import { z } from "zod";
import { Button } from "../ui/button";

function exportData(uuid: string, name: string) {
  const storedData = localStorage.getItem(uuid);
  if (!storedData) {
    alert(`Aucune donnée trouvée avec l'uuid ${uuid}.`);
    return;
  }

  const blob = new Blob([storedData], { type: "application/json" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  if (name) {
    link.download = `plan-appetit_${name}.json`;
  } else {
    link.download = `plan-appetit_configuration_${Date.now()}.json`;
  }
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

function importData(
  typeConfig: String,
  configService:
    | TjmConfigService
    | HouseConfigService
    | RestaurantConfigService,
  file: File,
  callback: () => void
) {
  const mealSchema = z.object({
    covers: z.int(),
    starterPrice: z.int(),
    mainCoursePrice: z.int(),
    dessertPrice: z.int(),
    drinkPrice: z.int(),
  });
  const weekSchema = z.object({
    name: z.string(),
    meals: z.array(mealSchema),
  });
  const restauSchema = z.object({
    uuid: z.string(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    week: z.array(weekSchema),
    stats: z.object({
      workedWeeks: z.number().int(),
    }),
  });
  const abstractNumberSchema = z.object({
    uuid: z.string(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    currency: z.string().optional(),
    value: z.number(),
  });
  const tjmSchema = z.object({
    uuid: z.string(),
    name: z.string(),
    tjm: abstractNumberSchema,
    inclTjmTVA: z.boolean(),
    tax: z.array(abstractNumberSchema),
    workedDays: z.array(abstractNumberSchema),
    total: abstractNumberSchema,
    inclTotalTVA: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });
  const houseSchema = z.object({
    uuid: z.string(),
    name: z.string(),
    loanAmount: abstractNumberSchema,
    annualInterestRate: abstractNumberSchema,
    loanTermMonths: abstractNumberSchema,
    preferLoanYear: z.boolean(),
    annualInsuranceRate: abstractNumberSchema,
    inclInsurance: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });
  const reader = new FileReader();

  reader.onload = (event) => {
    const fileText = event.target?.result as string;
    const newConfig = JSON.parse(fileText);

    try {
      switch (typeConfig) {
        case "restaurant":
          restauSchema.parse(newConfig);
          break;
        case "tjm":
          tjmSchema.parse(newConfig);
          break;
        case "house":
          houseSchema.parse(newConfig);
          break;
      }

      configService.setConfig(newConfig);
      alert(
        `Importation réussie ! Les données ont été enregistrées dans localStorage (clé '${configService.CONFIG_KEY}').`
      );
      callback();
    } catch {
      alert("Le fichier n'est pas au bon format");
    }
  };

  reader.onerror = (event) => {
    alert("Une erreur est survenue lors de la lecture du fichier.");
    console.error(event);
  };

  reader.readAsText(file);
}

export function ExportConfigurationButton({
  uuid,
  name,
}: {
  uuid: string;
  name: string;
}) {
  const handleExport = () => {
    exportData(uuid, name);
  };

  return (
    <Button
      onClick={handleExport}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-sm"
    >
      Export
    </Button>
  );
}

export function ImportConfigurationButton({
  typeConfig,
  fetchConfigs,
  configService,
}: {
  typeConfig: String;
  fetchConfigs: () => void;
  configService:
    | TjmConfigService
    | HouseConfigService
    | RestaurantConfigService;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importData(typeConfig, configService, file, fetchConfigs);
  };

  return (
    <>
      <Button
        onClick={handleImportClick}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-sm mr-2"
      >
        Import
      </Button>

      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
