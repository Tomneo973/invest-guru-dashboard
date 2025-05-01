
import { RealEstateProperty } from "../types";
import { PropertyCard } from "./PropertyCard";
import { EmptyState } from "./EmptyState";

interface PropertyListProps {
  properties: RealEstateProperty[];
  isLoading: boolean;
  filter: "all" | "rented" | "not_rented" | "sold";
  onPropertyClick: (property: RealEstateProperty) => void;
  onAddNew: () => void;
}

export function PropertyList({
  properties,
  isLoading,
  filter,
  onPropertyClick,
  onAddNew,
}: PropertyListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 animate-pulse bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return <EmptyState filter={filter} onAddNew={onAddNew} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={() => onPropertyClick(property)}
        />
      ))}
    </div>
  );
}
