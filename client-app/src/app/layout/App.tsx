import React, { Fragment } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from './navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { observer } from 'mobx-react-lite';
import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from '../../features/home/HomePage';
import ActivityForm from '../../features/activities/form/ActivityForm';
import ActivityDetails from '../../features/activities/details/ActivityDetails';
import { ToastContainer } from 'react-toastify';
import NotFound from '../../features/error/NotFound';
function App() {
  const location=useLocation();
  if(location)
  console.log(location.key);
  return (
    <Fragment>
      <NavBar/>
      <ToastContainer position='bottom-right' hideProgressBar/>
      <Container style={{marginTop:'7em'}}>
        <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/activities' element={<ActivityDashboard/>}/>   
        <Route path='/activities/:id' element={<ActivityDetails/>}/>        
        <Route path='/createactivity' element={<ActivityForm key={location.key}/>}/>   
        <Route path='/manage/:id' element={<ActivityForm key={location.key} />}/>
        <Route path='*' element={<NotFound/>}/>     
        </Routes>
      </Container>
    </Fragment>
  );
}

export default observer(App);
