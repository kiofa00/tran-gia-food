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
    <span style={{ whiteSpace: 'nowrap' }}>
      <span style={{ marginRight: 6 }}>{icon}</span>
      {label}
    </span>
  );
};
