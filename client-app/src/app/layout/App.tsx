import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { Container } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
function App() {
  const [Activities, setActivities]=useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity]=useState<Activity | undefined>(undefined);
  const [editMode, setEditMode]=useState(false);
  useEffect(()=>{
    axios.get<Activity[]>("http://localhost:5000/api/activities").then(response =>{
      console.log(response);
      setActivities(response.data);
    })
  },[]);

  function handleSelectActivity(id:string)
  {
    setSelectedActivity(Activities.find(x=>x.id===id));
  }

  function handleFormOpen(id?:string)
  {
    id ? handleSelectActivity(id):handleCanceledActivity();
    setEditMode(true);
  }

  function handleFormClose()
  {
    setEditMode(false);
  }
  function handleCanceledActivity()
  {
    setSelectedActivity(undefined);
  }
  function handleDeleteActivity(id:string)
  {
    setActivities([...Activities.filter(x=>x.id!==id)]);
  }
  function handleCreateAndEditActivity(activity: Activity)
  {
    activity.id?setActivities([...Activities.filter(x=>x.id!==activity.id), activity]):
    setActivities([...Activities, {...activity, id: uuid()}]);
    setEditMode(false);
    setSelectedActivity(activity);
  }
  return (
    <Fragment>
      <NavBar openForm={handleFormOpen}/>
      <Container style={{marginTop:'7em'}}>
        <ActivityDashboard 
        activities={Activities}
        selectedActivity={selectedActivity}
        selectActivity={handleSelectActivity}
        cancelSelectActivity={handleCanceledActivity}
        editMode={editMode}
        openForm={handleFormOpen}
        closeForm={handleFormClose}
        createOrEdit={handleCreateAndEditActivity}
        deleteActivity={handleDeleteActivity}
        />
      </Container>
    </Fragment>
  );
}

export default App;
