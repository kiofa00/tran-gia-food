import React from 'react';

import { getVehicleIcon, mapVehicleType } from '@/utils/formatters';

interface VehicleBadgeProps {
  vehicle?: string;
  type?: string;
}

export const VehicleBadge: React.FC<VehicleBadgeProps> = ({ vehicle, type }) => {
  const vehicleValue = vehicle || type;

  if (!vehicleValue) return <span>—</span>;
  const label = mapVehicleType(vehicleValue);
  const icon = getVehicleIcon(vehicleValue);

  return (
    <span className="whitespace-nowrap">
      <span className="mr-1.5">{icon}</span>
      {label}
    </span>
  );
};
