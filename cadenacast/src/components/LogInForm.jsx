import { useState } from 'react';
import { addUserData } from '../firebase/firestore.js';
import LocationDropdown from './LocationDropdown.jsx';

function LogInForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    location: '',
    nationalIDNumber: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Skip Firebase Authentication — only store user data
      await addUserData({
        ...formData,
        createdAt: new Date()
      });
  
      alert('Registration successful!');
    } catch (error) {
      console.error('Error:', error);
      alert(`Registration failed: ${error.message}`);
    }
  };
  

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('input-', '')]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Personal Information</h3>
      <p>Please provide accurate information to continue</p>
      
      <label htmlFor="input-firstName">First Name</label>
      <input id="input-firstName" type="text" onChange={handleChange} required />
      
      <label htmlFor="input-middleName">Middle Name</label>
      <input id="input-middleName" type="text" onChange={handleChange} />
      
      <label htmlFor="input-lastName">Last Name</label>
      <input id="input-lastName" type="text" onChange={handleChange} required />
      
      <label htmlFor="input-birthDate">Birth Date</label>
      <input id="input-birthDate" type="date" onChange={handleChange} required />
      
      <LocationDropdown onChange={(value) => setFormData(prev => ({ ...prev, location: value }))} />
      
      <label htmlFor="input-nationalIDNumber">National ID Card Number</label>
      <input id="input-nationalIDNumber" type="text" onChange={handleChange} required />
      
      <p>By clicking 'Continue' you agree with the Terms and Private Policy</p>
      <button type="submit">Continue</button>
    </form>
  );
}

export default LogInForm;