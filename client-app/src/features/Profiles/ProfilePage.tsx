import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import { useStore } from "../../app/store/Store";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";

export default observer( function ProfilePage(){
    const {username}=useParams<{username:string}>();
    const {profileStore}=useStore();
    const {loadingProfile, loadProfile, profile}=profileStore;

    useEffect(()=>{
        loadProfile(username!);
    },[loadProfile, username]);
    return (
        <Grid>
            <Grid.Column width={16}>
                {profile &&
                <>
                <ProfileHeader profile={profile}/>
                <ProfileContent profile={profile}/>
                </>}
            </Grid.Column>
        </Grid>
    )
});