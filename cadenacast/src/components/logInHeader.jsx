import logo from '../resources/cadenacast-whitebg.png';
import '../compontent-styles/logInHeader.css';
function LogInHeader()
{
    return(
        <>
            <p>Elections</p>
            <p>2025</p>
            <img src={logo} alt='CadenaCast logo'/>
            <p>Powered by Jomafa</p>
        </>
    );
}

export default LogInHeader