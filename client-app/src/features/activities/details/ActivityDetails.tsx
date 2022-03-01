import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/store/Store";
import ActivityDetailChat from "./ActivityDetailChat";
import ActivityDetailInfo from "./ActivityDetailedInfo";
import ActivityDetailHeader from "./ActivityDetailHeader";
import ActivityDetailSidebar from "./ActivityDetailSidebar";


export default observer( function ActivityDetails()
{
  const {activityStore}=useStore();
  const{selectedActivity:activity, loadActivity, loadingInitials}=activityStore;

  const {id}=useParams<{id:string}>();
  useEffect(()=>{
    if(id) loadActivity(id);
  },[id, loadActivity])
  if(loadingInitials || !activity) return <LoadingComponent/>;
    return(
      <Grid>
        <Grid.Column width={10}>
          <ActivityDetailHeader activity={activity}/>
          <ActivityDetailInfo activity={activity}/>
          <ActivityDetailChat/>
        </Grid.Column>
        <Grid.Column width={6}>
          <ActivityDetailSidebar/>
        </Grid.Column>
      </Grid>
    )
})