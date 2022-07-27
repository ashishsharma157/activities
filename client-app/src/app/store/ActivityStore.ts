import { format } from "date-fns";
import {  makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../API/agent";
import { Activity, ActivityFormValues } from "../models/activity";
import { Pagination, PagingParams } from "../models/Pagination";
import { Profile } from "../models/Profile";
import { store } from "./Store";

export default class ActivityStore{
    activityRegistry=new Map<string, Activity>();
    selectedActivity:Activity | undefined=undefined;
    editMode=false;
    loading=false;
    submitting=false;
    loadingInitials=false;
    pagination: Pagination | null=null;
    pagingParams=new PagingParams();
    predicate=new Map().set('all', true);
  
    constructor(){
        makeAutoObservable(this);

        reaction(
            ()=>this.predicate.keys(),
            ()=>{this.pagingParams=new PagingParams();
                this.activityRegistry.clear();
                this.loadActivities();
            }

        )
    }

    setPagingParams=(pagingParams: PagingParams)=>{
        this.pagingParams=pagingParams;
    }

    setPredicate=(predicate:string, value: string|Date)=>{
        const resetPrediciate=()=>{
            this.predicate.forEach((value, key)=>{
                if(key!=='startDate') this.predicate.delete(key);
            })
        }
        switch(predicate)
        {
            case 'all':
                resetPrediciate();
                this.predicate.set('all', true);
                break;
            case 'isGoing':
                resetPrediciate();
                this.predicate.set('isGoing', true);
                break;
            case 'isHost':
                resetPrediciate();
                this.predicate.set('isHost', true);
                break;
            case 'startDate':
                this.predicate.delete('startDate');
                this.predicate.set('startDate', value);
                break;
        }
    }

   get axiosParams() {
       const params=new URLSearchParams();
       params.append('pageNumber', this.pagingParams.pagenumber.toString());
       params.append('pageSize', this.pagingParams.PageSize.toString());
       this.predicate.forEach((value, key)=>{
           if(key==='startDate')
           {
               params.append(key, (value as Date).toISOString());
           }
           else
           {
               params.append(key, value);
           }
       })
       return params;
   }
    get activityByDate(){
        return Array.from(this.activityRegistry.values()).sort((a,b)=>
        a.date!.getTime()-b.date!.getTime());

    }

    get groupedActivities(){
        return Object.entries(
            this.activityByDate.reduce((activities, activity)=>{
                const date = format(activity.date!, 'dd MMM yyyy');
                activities[date]=activities[date]?[...activities[date], activity]:[activity];
                return activities;
            }, {} as {[key:string]:Activity[]})
        )
    }

    loadActivities= async ()=>{
        this.loadingInitials=true;
        try{
            const result=await agent.Activities.list(this.axiosParams);
            runInAction(()=>{
                result.data.forEach(activity => {
                    this.setActivity(activity);
                  });
                this.setPagination(result.pagination);  
                this.loadingInitials=false;
            })
        }catch(error)
        {
            console.log(error);
            runInAction(()=>{
                this.loadingInitials=false;
            })

        }
    }

    setPagination=(pagination:Pagination)=>{
        this.pagination=pagination;
    }

    loadActivity=async (id:string)=>{
        let activity=this.getActivity(id);
        if(activity)
        {
            this.selectedActivity=activity;
            return activity;
        }
        else
        {
            this.loadingInitials=true;
            try{
                    activity=await agent.Activities.details(id);
                    this.setActivity(activity);
                    runInAction(()=>{
                    this.selectedActivity=activity;
                    })
                    this.loadingInitials=false;
                    return activity;
            }catch(error)
            {
                console.log(error);
                this.loadingInitials=false;
            }

        }
    }
    private setActivity=(activity:Activity)=>{
        const user=store.userStore.user;
        if(user)
        {
            activity.isGoing=activity.attendees!.some(a=>a.username===user.userName);
            activity.isHost=activity.hostUserName===user.userName;
            activity.host=activity.attendees?.find(x=>x.username===activity.hostUserName);
        }
        activity.date=new Date(activity.date!);
        this.activityRegistry.set(activity.id, activity);
    }
    private getActivity=(id: string)=>
    {
        return this.activityRegistry.get(id);
    }
    


    createActivity=async (activity:ActivityFormValues)=>{
        const user=store.userStore.user;
        const attendee=new Profile(user!);
        this.loading=true;
        try
        {
            await agent.Activities.create(activity);
            const newActivity=new Activity(activity);
        newActivity.hostUserName=user!.userName;
        newActivity.attendees=[attendee];
        this.setActivity(newActivity);
            runInAction(()=>{
                this.selectedActivity=newActivity;
            })
        }
        catch(error)
        {
            console.log(error);
            runInAction(()=>{
                this.loading=false;
            })
        }
        
    }

    updateActivity=async (activity:ActivityFormValues)=>{
        this.loading=true;
        try
        {
            await agent.Activities.update(activity);
            runInAction(()=>{
                //this.Activities.filter(x=>x.id!==activity.id);
                //this.Activities.push(activity);
                if(activity.id){
                    let updateActivity={...this.getActivity(activity.id), ...activity};
                    this.activityRegistry.set(activity.id, updateActivity as Activity);
                    this.selectedActivity=updateActivity as Activity;
                }
          
            })
        }
        catch(error)
        {
            console.log(error);
            runInAction(()=>{
                this.loading=false;
            })
        }
    }
    deleteActivity=async (id:string)=>{
        this.loading=true;
        try
        {
            await agent.Activities.delete(id);
            runInAction(()=>{
                this.activityRegistry.delete(id);
                this.loading=false;                
            })
        }
        catch(error)
        {
            console.log(error);
            runInAction(()=>{
                this.loading=false;
            })
        }
    }

    updateAttendance=async()=>{
        const user=store.userStore.user;
        this.loading=true;
        try{
            await agent.Activities.attend(this.selectedActivity!.id);
            runInAction(()=>{
                if(this.selectedActivity?.isGoing){
                    this.selectedActivity.attendees=this.selectedActivity.attendees?.filter(a=> a.username!==user?.userName);
                    this.selectedActivity.isGoing=false;
                }
                else{
                    const attendee=new Profile(user!);
                    this.selectedActivity?.attendees?.push(attendee);
                    this.selectedActivity!.isGoing=true;
                }

                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            })
        }
        catch(error)
        {
            console.log(error);
        }
        finally{
            runInAction(()=>this.loading=false);
        }
    }

    cancelActivityToggle=async()=>{
        this.loading=true;
        try{
            await agent.Activities.attend(this.selectedActivity!.id);
            runInAction(()=>{
                this.selectedActivity!.isCancelled=!this.selectedActivity?.isCancelled;
                this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
            })
        }
        catch(error)
        {
            console.log(error);
        }
        finally{
            runInAction(()=>this.loading=false);
        }
    }

    clearSelectedActivity=()=>{
        this.selectedActivity=undefined;
    }

    updateAttendeeFollowing=(username:string)=>
    {
        this.activityRegistry.forEach(activity=>{
            activity.attendees.forEach(attendee=>{
                if(attendee.username===username)
                {
                    attendee.following?attendee.followerCount--: attendee.followerCount++;
                    attendee.following=!attendee.following;
                }
            })
        })
    }
}