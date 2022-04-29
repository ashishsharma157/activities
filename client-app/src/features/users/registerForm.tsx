import { Formik, Form, ErrorMessage } from 'formik';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Header } from 'semantic-ui-react';
import MyTextInput from '../../app/common/form/MyTextInput';
import { useStore } from '../../app/store/Store';
import * as Yup from 'yup';
import VaidationErrors from '../error/ValidationError';
export default observer( function RegisterForm(){
    const {userStore}=useStore();
    const navigate=useNavigate()
    return(
        <Formik initialValues={{displayName:'', username:'', email:'', password:'', error:null}}
        onSubmit={(value, {setErrors})=>userStore.register(value).catch(error=>
            setErrors({error}))}
        validationSchema={Yup.object({
            displayName:Yup.string().required(),
            username:Yup.string().required(),
            email:Yup.string().required().email(),
            password:Yup.string().required(),
        })}
        >
            {({handleSubmit, isSubmitting, errors, isValid, dirty})=>(
                <Form className='ui form error' onSubmit={handleSubmit} autoComplete='off'>
                    <Header as='h2' content='Sign up to Reactivity' color='teal' textAlign='center' />
                    <MyTextInput name='displayName' placeholder='Display Name'/>
                    <MyTextInput name='username' placeholder='User Name'/>
                    <MyTextInput name='email' placeholder='email'/>
                    <MyTextInput name='password' placeholder='Password' type='password'/>
                    <ErrorMessage name='error' render={()=>
                       <VaidationErrors errors={errors.error}/>}
                    />
                    <Button disabled={!isValid || !dirty || isSubmitting} loading={isSubmitting} positive content='Register' type='submit' fluid/>
                </Form>
            )}
        </Formik>
    )
})