import './App.css';
import '../src/components/logInHeader.jsx'
import LogInHeader from '../src/components/logInHeader.jsx';
import VotingTimer from '../src/components/votingTimer.jsx';
import SideNavTab from '../src/components/sideNavTab.jsx';

function App()
{
  return(
    <>
      <LogInHeader/>
      <VotingTimer/>
      <SideNavTab/>
    </>
  );
}

export default App;
