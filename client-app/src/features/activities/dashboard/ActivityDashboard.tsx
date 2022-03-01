import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/store/Store";
import ActivityFilter from "./ActivityFilters";

import ActivityList from "./ActivityList";

export default observer(function ActivityDashboard()
{
    const {activityStore}=useStore();
    const {loadActivities, activityRegistry}=activityStore;
    useEffect(()=>{
      if(activityRegistry.size<=1) loadActivities();
    },[loadActivities, activityRegistry.size]);
  
  
    if(activityStore.loadingInitials) return <LoadingComponent content='App Loading'/>
  

    return(
        <Grid>
            <Grid.Column width='10'>
                <ActivityList />
            </Grid.Column>
            <Grid.Column width='6'>
                <ActivityFilter/>
            </Grid.Column>
        </Grid>
    )
})