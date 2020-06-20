import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', "Incorrect Email or Password");//err.response.data.message
  }
};

export const logout = async () => {
  console.log("in logout function")
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};


//Old code by me below

/* eslint-disable */
//const { login } = require("../../Controllers/authController");
// const login = async (email, password) => {
//     try {
//       const res = await axios({
//         method: 'POST',
//         url: '/api/v1/users/login',
//         data: {
//           email,
//           password
//         }
//       });
//       console.log("status: ",res.data.status)
//       if (res.data.status === 'success') {
//               //showAlert('success', 'Logged in successfully!');
//               alert('Logged in successfully!');
//               window.setTimeout(() => {
//                 location.assign('/');
//               }, 1500);
//             }
//     }
//     catch(err){
//       //showAlert('error', err.response.data.message);
//       alert(err.response.data.message);
//     }
//   }



// document.querySelector('.form').addEventListener('submit',e=>{
//   e.preventDefault();
//   const email=document.getElementById('email').value;
//   const password=document.getElementById('password').value;
//   login(email,password);
// });