import React from 'react';
import { mapVehicleType, getVehicleIcon } from '../utils/formatters';

interface VehicleBadgeProps {
  vehicle?: string;
}

export const VehicleBadge: React.FC<VehicleBadgeProps> = ({ vehicle }) => {
  if (!vehicle) return <span>—</span>;
  const label = mapVehicleType(vehicle);
  const icon = getVehicleIcon(vehicle);

  return (
    <span className="whitespace-nowrap">
      <span className="mr-1.5">{icon}</span>
      {label}
    </span>
  );
};
