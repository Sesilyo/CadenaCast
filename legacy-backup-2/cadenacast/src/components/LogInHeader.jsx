import logo from '../resources/cadenacast-whitebg.png';
import '../styles/logInHeader.css';
function LogInHeader()
{
    return(
        <>
            <p className='elections'>Elections<br />2025</p>  
            <img className='img1' src={logo} alt='CadenaCast logo'/>
            <p className='powered-by'>Powered by: Jomafa Nalang</p>
        </>
    );
}

export default LogInHeader