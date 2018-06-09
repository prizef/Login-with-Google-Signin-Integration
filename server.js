import * as axios from "axios";

const URL_PREFIX = "";

export function users_getCurrentUser() {
  return axios.get(URL_PREFIX + "/api/users/getcurrentuser");
}

export function users_Login(data) {
  return axios.post(URL_PREFIX + "/api/users/login", data);
}

export function users_googleLogin(data) {
  return axios.post(URL_PREFIX + "/api/users/googlelogin", data);
}
