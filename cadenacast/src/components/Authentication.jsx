import LogInHeader from './LogInHeader';

function Authentication()
{
    return(
        <>
            <form>
                <LogInHeader/>
                <h3>2-Way Authentication</h3><br/>
                <p>Please enter your e-mail for verification</p>
                <input type="email"></input>
                <input type="submit"></input>
            </form>
        </>
    );
}

export default Authentication