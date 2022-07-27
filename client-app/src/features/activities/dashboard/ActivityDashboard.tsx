import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Grid, Loader } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { PagingParams } from "../../../app/models/Pagination";
import { useStore } from "../../../app/store/Store";
import ActivityFilter from "./ActivityFilters";


import ActivityList from "./ActivityList";
import ActivityListItemPlaceholder from "./ActivityListItemPlaceholder";

export default observer(function ActivityDashboard()
{
    const {activityStore}=useStore();
    const {loadActivities, activityRegistry, setPagingParams, pagination}=activityStore;
    const [loadingNext, setLoadingNext]=useState(false);

    function handleGetNext()
    {
        setLoadingNext(true);
        setPagingParams(new PagingParams(pagination!.CurrentPage+1))
        loadActivities().then(()=>setLoadingNext(false));
    }
    useEffect(()=>{
      if(activityRegistry.size<=1) loadActivities();
    },[loadActivities, activityRegistry.size]);
  
  
    // if(activityStore.loadingInitials && !loadingNext) return <LoadingComponent content='App Loading'/>
  

    return(
        <Grid>
            <Grid.Column width='10'>
                {activityStore.loadingInitials && !loadingNext?(
                    <>
                    <ActivityListItemPlaceholder/>
                    <ActivityListItemPlaceholder/>
                    </>
                ):(
                    <InfiniteScroll
                    pageStart={0}
                    loadMore={handleGetNext}
                    hasMore={!loadingNext && !!pagination && pagination.CurrentPage<pagination.totalPages}
                    initialLoad={false}
                    >
                    <ActivityList />
    
                    </InfiniteScroll>
                )}

                {/* <Button floated="right"
                content='Mare..'
                positive
                onClick={handleGetNext}
                loading={loadingNext}
                disabled={pagination?.totalPages===pagination?.CurrentPage}
                /> */}

            </Grid.Column>
            <Grid.Column width='6'>
                <ActivityFilter/>
            </Grid.Column>
            <Grid.Column width={10}>
                <Loader active={loadingNext}/>
            </Grid.Column>
        </Grid>
    )
})