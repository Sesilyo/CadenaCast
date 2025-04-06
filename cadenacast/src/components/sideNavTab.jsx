import '../styles/sideNavTab.css';
import logo from '../resources/cadenacast-whitebg.png';
import CountdownTimer from './votingTimer';

const SideNavTab = () => {
  return (
    <div>
      <div className="logo">ELECTIONS<br />2025</div>
      <div className="countdown">
        <div className="label">Voting opens in:</div>
        <CountdownTimer />
      </div>

      <nav className="nav">
        <a href="#" className="nav-item">
          🔗 Connect Wallet
        </a>
        <a href="#" className="nav-item">
          🗳️ Vote
        </a>
        <a href="#" className="nav-item">
          📊 Results
        </a>
        <a href="#" className="nav-item active">
          ⚙️ Admin Controls
        </a>
      </nav>

      <div className="powered">
        POWERED BY:
      </div>

      <div className="bottom-image-container">
        <img src={logo} alt="Logo" className="bottom-image" />
      </div>
    </div>
  );
};

export default SideNavTab
