import React, { useState, useEffect } from 'react';
import './App.css';

function Login_Page1() {
  const [showPopup, setShowPopup] = useState(true);
  const [middleNameDisabled, setMiddleNameDisabled] = useState(false);
  const [suffixVisible, setSuffixVisible] = useState(false);

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSuffixChange = (e) => {
    if (e.target.value === 'Others') {
      setSuffixVisible(true);
    } else {
      setSuffixVisible(false);
    }
  };

  useEffect(() => {
    // additional event (placeholder)
  }, []);

  return (
    <div>
      {showPopup && (
        <div id="popup" className="popup">
          <h1>Consent</h1>
          <p>
            By clicking <strong>“Proceed”</strong>, I hereby give consent to the Philippine Statistics Authority (PSA) to use my demographic information (i.e. First Name, Middle Name (optional), Last Name, and Date of Birth) and Facial Image, as submitted through the National ID website, to verify my identity and retrieve my digital National ID.
          </p>
          <button onClick={closePopup} className="proceed">Proceed</button>
        </div>
      )}

      <h1 className="elections-heading">ELECTIONS<br />2025</h1>
      <div className="powered-by">POWERED BY:</div>

      <img className="img" src="/Cadena Cast.png" alt="Cadena Cast" />
      <span className="box1">Personal Information</span>

      <div className="form-container">
        <form>
          <p className="p1">Please enter correct information.</p>

          <p className="first-name">First Name</p>
          <input id="input-first-name" type="text" required />

          <div id="suffix-wrapper">
            <label for="input-suffix">Suffix</label>
            <select id="input-suffix" name="suffix" onChange={handleSuffixChange}>
              <option value="None">N/A</option>
              <option value="Senior">Sr.</option>
              <option value="Junior">Jr.</option>
              <option value="Third">III</option>
              <option value="Others">Others (please specify)</option>
            </select>

            {suffixVisible && (
              <>
                <input
                  type="text"
                  id="other-suffix"
                  name="other-suffix"
                  placeholder="Please specify suffix"
                  style={{ display: 'block' }}
                />
                <button type="button" className="button2" id="back-to-dropdown" style={{ display: 'inline-block' }}>
                  Back to Suffix Options
                </button>
              </>
            )}
          </div>

          <div className="middle-name-container">
            <div id="input-middle-name" className="middle-name-label">
              <p>Middle Name</p>
              <div className="no-middle-name">
                <input
                  type="checkbox"
                  id="no-middle-name"
                  onChange={() => setMiddleNameDisabled(!middleNameDisabled)}
                />
                <label for="no-middle-name">No middle name</label>
              </div>
            </div>
            <input type="text" disabled={middleNameDisabled} />
          </div>

          <p>Last Name</p>
          <input id="input-last-name" type="text" required />

          <p>Date of Birth (MM/DD/YYYY)</p>
          <input id="input-date" type="date" required />

          <div id="places-container">
            <p>Region</p>
            <input id="input-region" type="text" required />
            <p>Province</p>
            <input id="input-province" type="text" required />
            <p>City/Municipality</p>
            <input id="input-city-municipality" type="text" required />
          </div>

          <div className="national-id-container">
            <label for="input-national-ID">National ID Card Number</label>
          </div>
          <input id="input-national-ID" type="text" required />

          <p>
            By clicking continue, you agree with <a href="https://national-id.gov.ph/#">Terms and Conditions</a> and <a href="https://national-id.gov.ph/#">Privacy Policy</a>
          </p>

          <button type="submit" className="button1">Continue</button>
        </form>
      </div>
    </div>
  );
}

export default Login_Page1;
