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

const regionSelect = document.getElementById('region');
const provinceSelect = document.getElementById('province');
const citySelect = document.getElementById('city');

function populateSelect(selectElement, options) {
  selectElement.innerHTML = '<option value="">-- Select --</option>';
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    selectElement.appendChild(opt);
  });
}

function handleRegionChange() {
  const selectedRegion = regionSelect.value;
  if (selectedRegion) {
    const provinces = Object.keys(locationData[selectedRegion]);
    populateSelect(provinceSelect, provinces);
    provinceSelect.disabled = false;
    citySelect.innerHTML = '<option value="">-- Select City/Municipality --</option>';
    citySelect.disabled = true;
  } else {
    provinceSelect.innerHTML = '<option value="">-- Select Province --</option>';
    provinceSelect.disabled = true;
    citySelect.innerHTML = '<option value="">-- Select City/Municipality --</option>';
    citySelect.disabled = true;
  }
}

function handleProvinceChange() {
  const selectedRegion = regionSelect.value;
  const selectedProvince = provinceSelect.value;
  if (selectedProvince) {
    const cities = locationData[selectedRegion][selectedProvince];
    populateSelect(citySelect, cities);
    citySelect.disabled = false;
  } else {
    citySelect.innerHTML = '<option value="">-- Select City/Municipality --</option>';
    citySelect.disabled = true;
  }
}

regionSelect.addEventListener('change', handleRegionChange);
provinceSelect.addEventListener('change', handleProvinceChange);

populateSelect(regionSelect, Object.keys(locationData));
