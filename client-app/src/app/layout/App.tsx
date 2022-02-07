import React, { Fragment, useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './navbar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
import agent from '../API/agent';
import LoadingComponent from './LoadingComponent';
function App() {
  const [Activities, setActivities]=useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity]=useState<Activity | undefined>(undefined);
  const [editMode, setEditMode]=useState(false);
  const [loading, setLoading]=useState(true);
  const [submitting, setSubmitting]=useState(false);
  useEffect(()=>{
    agent.Activities.list().then(response =>{
      console.log(response);
      let activities:Activity[]=[];
      response.forEach(activity => {
        activity.date=activity.date.split('T')[0];
        activities.push(activity);
      });
      setActivities(response);
      setLoading(false);
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
    setSubmitting(true)
    agent.Activities.delete(id).then(()=>{
      setActivities([...Activities.filter(x=>x.id!==id)]);
      setSubmitting(false);
    })
  }
  function handleCreateAndEditActivity(activity: Activity)
  {
    setSubmitting(true);
    if(activity.id)
    {
      agent.Activities.update(activity).then(()=>{
        setActivities([...Activities.filter(x=>x.id!==activity.id), activity])
        setEditMode(false);
        setSubmitting(false);
        setSelectedActivity(activity);
      })
    }
    else
    {
      activity.id=uuid();
      agent.Activities.create(activity).then(()=>{
        setActivities([...Activities, activity]);
        setEditMode(false);
        setSubmitting(false);
        setSelectedActivity(activity);
      })
    }
  }
  if(loading) return <LoadingComponent content='App Loading'/>
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
        submitting={submitting}
        />
      </Container>
    </Fragment>
  );
}

export default App;
