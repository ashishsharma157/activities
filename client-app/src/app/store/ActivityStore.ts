import { format } from "date-fns";
import {  makeAutoObservable, runInAction } from "mobx";
import agent from "../API/agent";
import { Activity, ActivityFormValues } from "../models/activity";
import { Profile } from "../models/Profile";
import { store } from "./Store";

export default class ActivityStore{
    activityRegistry=new Map<string, Activity>();
    selectedActivity:Activity | undefined=undefined;
    editMode=false;
    loading=false;
    submitting=false;
    loadingInitials=false;
  
    constructor(){
        makeAutoObservable(this)
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
            const activities=await agent.Activities.list();
            runInAction(()=>{
                activities.forEach(activity => {
                    this.setActivity(activity);
                  });
                  
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
}