import React, { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button, Form, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/store/Store";
import {v4 as uuid} from 'uuid';


export default ( function ActivityForm()
{
    const {activityStore}=useStore();
    const navigate=useNavigate();
    const { loading, createActivity, updateActivity, 
        loadActivity, loadingInitials}=activityStore;
    const {id} = useParams<{id:string}>();
    const[activity, setActivity]=useState({        
    id:'',
    title:'',
    description:'',
    date:'',
    category:'',
    city:'',
    venue:''});


    useEffect(()=>{
        if(id) loadActivity(id).then(activity=>setActivity(activity!));
    },[id, loadActivity])

    function handleSubmit()
    {
        if(activity.id.length===0)
        {
            let newActivity={
                ...activity,
                id:uuid()
            }
            createActivity(newActivity).then(()=>navigate(`/activities/${newActivity.id}`))
        }
        else{
            updateActivity(activity).then(()=>navigate(`/activities/${activity.id}`));
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
    {
        const{name, value}=event.target;
        setActivity({...activity, [name]:value});
    }

    if(loadingInitials) return <LoadingComponent content="loading activity ..."/>
    return (
        <Segment clearing>
            <Form onSubmit={handleSubmit} autoComplete='off'>
                <Form.Input placeholder='Title' value={activity.title} name='title' onChange={handleInputChange} />
                <Form.TextArea placeholder='Description' value={activity.description} name='description' onChange={handleInputChange} />
                <Form.Input placeholder='Category'  value={activity.category} name='category' onChange={handleInputChange} />
                <Form.Input type='date' placeholder='Date' value={activity.date} name='date' onChange={handleInputChange} />
                <Form.Input placeholder='City' value={activity.city} name='city' onChange={handleInputChange} />
                <Form.Input placeholder='Venue' value={activity.venue} name='venue' onChange={handleInputChange} />
                <Button loading={loading} floated="right" positive type="submit" content="Submit"/>
                <Button as={Link} to='/activities' floated="right" type="button" content="Cancel"/>
            </Form>
        </Segment>
    )
})