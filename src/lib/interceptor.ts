import axios from "axios";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    // config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },

//   async function (error) {
//     const originalRequest = error.config;

//     if (
//       error.response.status === 401
//     ) {
//       navigate("/login");
//       return Promise.reject(error);
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
