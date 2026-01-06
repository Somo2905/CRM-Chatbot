import React from 'react';
import { User, Mail, Phone, Car, Calendar, Award } from 'lucide-react';
import { Customer } from '../../types/chat';

interface CustomerInfoProps {
  customer: Customer;
}

export function CustomerInfo({ customer }: CustomerInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{customer.name}</h3>
            <p className="text-blue-100 text-sm">Premium Customer</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{customer.email}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{customer.phone}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Car className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">{customer.vehicles}</p>
            <p className="text-xs text-gray-500">Vehicles</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {new Date(customer.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-gray-500">Last Visit</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Award className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900">{customer.loyaltyPoints}</p>
            <p className="text-xs text-gray-500">Points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
