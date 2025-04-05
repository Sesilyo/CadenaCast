
function LogInForm()
{
    return(
        <>
            <h3>Personal Information</h3>
            <p>Please provide accurate information to continue</p>
            <label htmlFor="input-firstName">First Name</label>
            <input id="input-firstName" type="text"></input>
            <label htmlFor="input-middleName">Middle Name</label>
            <input id="input-middleName" type="text"></input>
            <label htmlFor="input-lastName">Last Name</label>
            <input id="input-lastName" type="text"></input>
            <label htmlFor="input-birthDate">Birth Date</label>
            <input id="input-birthDate" type="date"></input>
            
            <div id="places-container">
                <label>Region</label>
                <label>Province</label>
                <label>City/Municipality</label>
            </div>
        </>
    );
}

export default LogInForm