import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../API/agent";
import { Photo, Profile } from "../models/Profile";
import { store } from "./Store";

export default class ProfileStore{
    profile:Profile|null=null;
    loadingProfile=false;
    uploading=false;
    loading=false;
    followings:Profile[]=[];
    loadingFollowings=false;
    activeTab=0;
    constructor(){
        makeAutoObservable(this);

        reaction(
            ()=> this.activeTab,
                activeTab=>{
                if(activeTab===3 || this.activeTab===4){
                    const predicate=this.activeTab===3? "followers":"Following";
                    this.loadFollowing(predicate);
                }
                else{
                    this.followings=[];
                }
        })
    }
    setActiveTab=(activeTab:any)=>{
        this.activeTab=activeTab;
    }
    get isCurrentUser(){
        if(store.userStore.user && this.profile){
            return store.userStore.user.userName===this.profile.username;
        }

        return false;
    }

    loadProfile=async (username: string)=>{
        this.loadingProfile=true;
        try{
            const profile=await agent.Profiles.get(username);
            runInAction(()=>{
                this.profile=profile;
                this.loadingProfile=false;
            })
        }
        catch(error)
        {
            console.log(error);
            runInAction(()=>this.loadingProfile=false);
        }
    }

    uploadPhoto = async(file: Blob)=>{
        this.uploading=true;
        try{
            const response=await agent.Profiles.uploadPhoto(file);
            const photo=response.data;
            runInAction(()=>{
                if(this.profile){
                    this.profile.photos?.push(photo);
                    if(photo.isMain && store.userStore.user){
                        store.userStore.setImage(photo.url);
                        this.profile.image=photo.url;
                    }
                }
                this.uploading=false;
            })
        }
        catch(error)
        {
            console.log(error);
            runInAction(()=>this.uploading=false);
        }
    }

    setMainPhoto=async(photo: Photo)=>{
        this.loading=true;
        try{
            await agent.Profiles.setMainPhoto(photo.id);
            store.userStore.setImage(photo.url);
            runInAction(()=>{
                if(this.profile && this.profile.photos){
                    this.profile.photos.find(p=>p.isMain)!.isMain=false;
                    this.profile.photos.find(p=>p.id===photo.id)!.isMain=true;
                    this.profile.image=photo.url;
                    this.loading=false;
                }
            })
        }catch(error){
            runInAction(()=>this.loading=false);
            console.log(error);
        }
    }

    deletePhoto=async (photo:Photo)=>{
        this.loading=true;
        try{
            await agent.Profiles.deletePhoto(photo.id);
            runInAction(()=>{
                if(this.profile){
                    this.profile.photos=this.profile.photos?.filter(p=>p.id!==photo.id);
                    this.loading=false;
                }
            })
        }
        catch(error){
            runInAction(()=>this.loading=false);
            console.log(error);
        }
    }

    updateFollowing=async (username:string, following:boolean)=>{
        this.loading=true;
        try
        {
            await agent.Profiles.updateFollowing(username);
            store.activityStore.updateAttendeeFollowing(username);
            runInAction(()=>{
                if(this.profile && this.profile.username!==store.userStore.user?.userName && this.profile.username===username){
                    following?this.profile.followerCount++ : this.profile.followerCount--;
                    this.profile.following=!this.profile.following;
                }
                if(this.profile && this.profile.username===store.userStore.user?.userName){
                    following?this.profile.followingCount++:this.profile.followingCount--;
                }
                this.followings.forEach(profile=>{
                    if(profile.username===username)
                    {
                        profile.following?profile.followerCount--: profile.followerCount++;
                        profile.following=!profile.following;
                    }
                })

                this.loading=false;
            })
        }
        catch(error)
        {
            console.log(error);
            runInAction(()=>this.loading=false);
        }
    }

    loadFollowing=async(predicate:string)=>{
        this.loadingFollowings=true;

        try{
            const following=await agent.Profiles.listFollowings(this.profile!.username, predicate);
            runInAction(()=>{
                this.followings=following;
                this.loadingFollowings=false;

            })
        }
        catch(error)
        {
            console.log(error);
            runInAction(()=>this.loadingFollowings=false);
        }
    }
}