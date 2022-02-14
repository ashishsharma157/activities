import React, { Fragment, useEffect } from 'react';
import { Container } from 'semantic-ui-react';
import NavBar from './navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import LoadingComponent from './LoadingComponent';
import { useStore } from '../store/Store';
import { observer } from 'mobx-react-lite';
function App() {
  const {activityStore}=useStore();
  useEffect(()=>{
    activityStore.loadActivities();
  },[activityStore]);


  if(activityStore.loadingInitials) return <LoadingComponent content='App Loading'/>
  return (
    <Fragment>
      <NavBar/>
      <Container style={{marginTop:'7em'}}>
        <ActivityDashboard />
      </Container>
    </Fragment>
  );
}

export default observer(App);
