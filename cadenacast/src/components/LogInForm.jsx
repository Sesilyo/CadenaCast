import LocationDropdown from './LocationDropdown.jsx';
import '../styles/logInForm.css'

function LogInForm()
{
    return(
        <>
        <div id='logIn-form'>
          <form className='form1'>
            <h3 id='personal-information'>Personal Information</h3>
            <p>Please provide accurate information to continue</p>
            <label htmlFor="input-firstName">First Name</label>
            <input id="input-firstName" type="text"></input>
            <label htmlFor="input-middleName">Middle Name</label>
            <input id="input-middleName" type="text"></input>
            <label htmlFor="input-lastName">Last Name</label>
            <input id="input-lastName" type="text"></input>
            <label htmlFor="input-birthDate">Birth Date</label>
            <input id="input-birthDate" type="date"></input>
            
            <LocationDropdown />

            <label htmlFor="input-nationalIDNumber">National ID Card Number</label>
            <input id="input-nationalIDNumber" type="value"></input>

            <p>By clicking 'Continue' you agree with the Terms and Private Policy</p>
            <input id="input-submit" type="submit"></input>
          </form>
        </div>
            
        </>
    );
}

export default LogInForm