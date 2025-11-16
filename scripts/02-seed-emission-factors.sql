-- Insert common emission factors for various activities
INSERT INTO emission_factors (activity_type, category, scope, unit, factor, source, region) VALUES
-- Scope 1: Direct emissions
('Natural Gas', 'Stationary Combustion', 1, 'kWh', 0.18385, 'EPA', 'US'),
('Diesel', 'Mobile Combustion', 1, 'liters', 2.68, 'EPA', 'US'),
('Gasoline', 'Mobile Combustion', 1, 'liters', 2.31, 'EPA', 'US'),
('Propane', 'Stationary Combustion', 1, 'kg', 2.98, 'EPA', 'US'),

-- Scope 2: Indirect emissions from purchased energy
('Electricity', 'Purchased Electricity', 2, 'kWh', 0.4, 'EPA', 'US'),
('Steam', 'Purchased Steam', 2, 'MMBtu', 66.33, 'EPA', 'US'),

-- Scope 3: Other indirect emissions
('Business Travel - Air', 'Business Travel', 3, 'km', 0.255, 'DEFRA', 'UK'),
('Business Travel - Car', 'Business Travel', 3, 'km', 0.171, 'DEFRA', 'UK'),
('Business Travel - Rail', 'Business Travel', 3, 'km', 0.041, 'DEFRA', 'UK'),
('Hotel Stay', 'Business Travel', 3, 'nights', 29.3, 'DEFRA', 'UK'),
('Paper', 'Purchased Goods', 3, 'kg', 0.91, 'DEFRA', 'UK'),
('Water Supply', 'Water', 3, 'cubic meters', 0.344, 'DEFRA', 'UK'),
('Waste to Landfill', 'Waste', 3, 'kg', 0.467, 'DEFRA', 'UK'),
('Waste Recycling', 'Waste', 3, 'kg', 0.021, 'DEFRA', 'UK'),

-- Additional common activities
('Coal', 'Stationary Combustion', 1, 'kg', 2.42, 'EPA', 'US'),
('Heating Oil', 'Stationary Combustion', 1, 'liters', 2.52, 'EPA', 'US'),
('Refrigerants - R134a', 'Fugitive Emissions', 1, 'kg', 1430, 'EPA', 'US'),
('Refrigerants - R410A', 'Fugitive Emissions', 1, 'kg', 2088, 'EPA', 'US')

ON CONFLICT DO NOTHING;
