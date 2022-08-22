import React, { Fragment, useEffect } from 'react';
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
import LoginForm from '../../features/users/LoginForm';
import { useStore } from '../store/Store';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modal/modalContainer';
import ProfilePage from '../../features/Profiles/ProfilePage';
import PrivateRoute from './PrivateRoute';
function App() {
  const location=useLocation();
  const {commonStore, userStore}=useStore();
  
  useEffect(()=>{
    if(commonStore.token){
      userStore.getUser().finally(()=>commonStore.setAppLoaded());
    }
    else
    {
      userStore.getFacebookLoginStatus().then(()=>commonStore.setAppLoaded());
    }
  },[commonStore, userStore])
  if(location)
  console.log(location.key);

if(!commonStore.appLoaded) return <LoadingComponent content='Loading App...'/>

  return (
    <Fragment>
      <NavBar/>
      <ToastContainer position='bottom-right' hideProgressBar/>
      <ModalContainer/>
      <Container style={{marginTop:'7em'}}>
        <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/activities' element={<PrivateRoute><ActivityDashboard/></PrivateRoute>}/>   
        <Route path='/activities/:id' element={<PrivateRoute><ActivityDetails/></PrivateRoute>}/>        
        <Route path='/createactivity' element={<PrivateRoute><ActivityForm key={location.key}/></PrivateRoute>}/>   
        <Route path='/profiles/:username' element={<PrivateRoute><ProfilePage/></PrivateRoute>}/>
        <Route path='/manage/:id' element={<PrivateRoute><ActivityForm key={location.key} /></PrivateRoute>}/>
        <Route path='/login' element={<LoginForm/>}/>
        <Route path='*' element={<NotFound/>}/>     
        </Routes>
      </Container>
    </Fragment>
  );
}

export default observer(App);
