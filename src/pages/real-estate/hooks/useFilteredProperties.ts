
import { RealEstateProperty } from "../types";
import { useMemo } from "react";

export function useFilteredProperties(
  properties: RealEstateProperty[] | undefined,
  filter: "all" | "rented" | "not_rented" | "sold"
) {
  return useMemo(() => {
    if (!properties) return [];
    
    return properties.filter((property) => {
      switch (filter) {
        case "rented":
          return property.is_rented && !property.is_sold;
        case "not_rented":
          return !property.is_rented && !property.is_sold;
        case "sold":
          return property.is_sold;
        default:
          return true;
      }
    });
  }, [properties, filter]);
}
