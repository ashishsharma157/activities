import {  makeAutoObservable, runInAction } from "mobx";
import agent from "../API/agent";
import { Activity } from "../models/activity";

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
        Date.parse(a.date)-Date.parse(b.date));

    }

    get groupedActivities(){
        return Object.entries(
            this.activityByDate.reduce((activities, activity)=>{
                const date = activity.date;
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
        activity.date=activity.date.split('T')[0];
        this.activityRegistry.set(activity.id, activity);
    }
    private getActivity=(id: string)=>
    {
        return this.activityRegistry.get(id);
    }
    


    createActivity=async (activity:Activity)=>{
        this.loading=true;
        try
        {
            await agent.Activities.create(activity);
            runInAction(()=>{
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity=activity;
                this.editMode=false;
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

    updateActivity=async (activity:Activity)=>{
        this.loading=true;
        try
        {
            await agent.Activities.update(activity);
            runInAction(()=>{
                //this.Activities.filter(x=>x.id!==activity.id);
                //this.Activities.push(activity);
                this.activityRegistry.set(activity.id, activity);
                this.selectedActivity=activity;
                this.editMode=false;
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

}