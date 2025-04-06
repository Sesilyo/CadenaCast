import { Routes, Route } from 'react-router-dom';
import './App.css';
import LogInHeader from './components/logInHeader.jsx';
import LogInForm from '../src/components/LogInForm.jsx';
import Authentication from './components/Authentication.jsx';
import AdminControlsPage from './components/AdminControlsPage.jsx';

function App()
{
  return(
    <>
      <LogInHeader/>
      <LogInForm/>

      
    </>
  );
}

export default App;