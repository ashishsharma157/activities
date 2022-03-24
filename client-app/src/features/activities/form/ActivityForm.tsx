import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button,  Header, Segment } from "semantic-ui-react";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import { useStore } from "../../../app/store/Store";
import {v4 as uuid} from 'uuid';
import { Formik, Form } from "formik";
import * as Yup from 'yup';
import { observer } from "mobx-react-lite";
import MyTextInput from "../../../app/common/form/MyTextInput";
import MyTextArea from "../../../app/common/form/MyTextArea";
import MySelectInput from "../../../app/common/form/MySelectInput";
import { categoryOptions } from "../../../app/common/Options/CategoryOptions";
import MyDateInput from "../../../app/common/form/MyDateInput";
import { Activity } from "../../../app/models/activity";

export default observer( function ActivityForm()
{
    const {activityStore}=useStore();
    const navigate=useNavigate();
    const { loading, createActivity, updateActivity, 
        loadActivity, loadingInitials}=activityStore;
    const {id} = useParams<{id:string}>();
    const[activity, setActivity]=useState<Activity>({        
    id:'',
    title:'',
    description:'',
    date:null,
    category:'',
    city:'',
    venue:''});

    const validationSchema=Yup.object({
        title: Yup.string().required('The activity title is required'),
        description: Yup.string().required('The activity discription is required'),
        category: Yup.string().required(),
        date: Yup.string().required('Date is required').nullable(),
        venue: Yup.string().required(),
        city: Yup.string().required(),
    })
    useEffect(()=>{
        if(id) loadActivity(id).then(activity=>setActivity(activity!));
    },[id, loadActivity])

    function handleFormSubmit(activity:Activity)
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

    // function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
    // {
    //     const{name, value}=event.target;
    //     setActivity({...activity, [name]:value});
    // }

    if(loadingInitials) return <LoadingComponent content="loading activity ..."/>
    return (
        <Segment clearing>
            <Header content='Activity Details' sub color="teal"/>
            <Formik 
            validationSchema={validationSchema}
            enableReinitialize initialValues={activity} onSubmit={values =>handleFormSubmit(values)}>
                {({handleSubmit, isValid, isSubmitting, dirty})=>(
                    <Form className="ui form" onSubmit={handleSubmit} autoComplete='off'>
                        {/* <FormField>
                            <Field placeholder='Title' name='title' />
                            <ErrorMessage name='title' render={error=><Label basic color='red' content={error}/>}/>
                        </FormField> */}
                     <MyTextInput name='title' placeholder="title"/>  
                    <MyTextArea rows={3} placeholder='Description'  name='description' />
                    <MySelectInput options={categoryOptions} placeholder='Category'   name='category' />
                   <MyDateInput placeholderText="Date"
                    name='date'
                    showTimeSelect
                    timeCaption="time"
                    dateFormat='MMMM d, yyyy h:mm aa'
                   />
                   <Header content='Location Details' sub color="teal"/>
                    <MyTextInput placeholder='City'  name='city' />
                    <MyTextInput placeholder='Venue'  name='venue' />
                    <Button 
                    disabled={isSubmitting || 
                        !isValid || !dirty}
                    loading={loading} floated="right" positive type="submit" content="Submit"/>
                    <Button as={Link} to='/activities' floated="right" type="button" content="Cancel"/>
                    </Form>
                )}
            </Formik>

        </Segment>
    )
})