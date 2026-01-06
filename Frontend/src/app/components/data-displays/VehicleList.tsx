import React from 'react';
import { Car, DollarSign, Package } from 'lucide-react';
import { Vehicle } from '../../types/chat';
import { Button } from '../ui/button';

interface VehicleListProps {
  vehicles: Vehicle[];
}

export function VehicleList({ vehicles }: VehicleListProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="font-semibold text-sm text-gray-900">Available Vehicles</h3>
      </div>
      <div className="divide-y">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{vehicle.price}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span className={
                        vehicle.stock === 'In Stock'
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }>
                        {vehicle.stock}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">VIN: {vehicle.vin}</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
