import { useState } from 'react';

const locationData = {
  'Region A': {
    'Province A1': ['City A1-1', 'City A1-2', 'City A1-3'],
    'Province A2': ['City A2-1', 'City A2-2', 'City A2-3'],
  },
  'Region B': {
    'Province B1': ['City B1-1', 'City B1-2', 'City B1-3'],
    'Province B2': ['City B2-1', 'City B2-2', 'City B2-3'],
  },
  'Region C': {
    'Province C1': ['City C1-1', 'City C1-2', 'City C1-3'],
  },
};

function LocationDropdown({ onChange }) {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedProvince('');
    setSelectedCity('');
    onChange?.({ region, province: '', city: '' });
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedCity('');
    onChange?.({ region: selectedRegion, province, city: '' });
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    onChange?.({ region: selectedRegion, province: selectedProvince, city });
  };

  const regionOptions = Object.keys(locationData);
  const provinceOptions = selectedRegion ? Object.keys(locationData[selectedRegion]) : [];
  const cityOptions = selectedProvince ? locationData[selectedRegion][selectedProvince] : [];

  return (
    <div id="places-container">
      <label htmlFor="region">Region</label>
      <select id="region" value={selectedRegion} onChange={handleRegionChange}>
        <option value="">-- Select Region --</option>
        {regionOptions.map((region) => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      <label htmlFor="province">Province</label>
      <select
        id="province"
        value={selectedProvince}
        onChange={handleProvinceChange}
        disabled={!selectedRegion}
      >
        <option value="">-- Select Province --</option>
        {provinceOptions.map((province) => (
          <option key={province} value={province}>{province}</option>
        ))}
      </select>

      <label htmlFor="city">City/Municipality</label>
      <select
        id="city"
        value={selectedCity}
        onChange={handleCityChange}
        disabled={!selectedProvince}
      >
        <option value="">-- Select City/Municipality --</option>
        {cityOptions.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
}

export default LocationDropdown;
