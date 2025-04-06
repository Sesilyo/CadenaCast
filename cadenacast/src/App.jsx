import { Routes, Route } from 'react-router-dom';
import './App.css';
import LogInHeader from './components/LogInHeader.jsx';
import LogInForm from '../src/components/LogInForm.jsx';
import Authentication from './components/Authentication.jsx';
import AdminControlsPage from './components/AdminControlsPage.jsx';

function App()
{
  return(
    <>
      <LogInHeader/>
      <LogInForm/>

      <AdminControlsPage/>
    </>
  );
}

export default App;