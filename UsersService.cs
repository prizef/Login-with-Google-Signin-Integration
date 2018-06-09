using Data.Providers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Models.Domain;
using Models.Requests;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Data;

namespace Services
{
    public class UsersService : IUsersService
    {
        private IAuthenticationService authenticationService;
        private IDataProvider dataProvider;

        public UsersService(IAuthenticationService authService, IDataProvider dataProvider)
        {
            authenticationService = authService;
            this.dataProvider = dataProvider;
        }

        public bool Login(UserLoginRequest model)
        {
            int userId = 0;
            string passwordHash = null;
            bool rememberMe = model.RememberMe;

            dataProvider.ExecuteCmd(
                "Users_GetPasswordFromEmail",
                inputParamMapper: parameters =>
                {
                    parameters.AddWithValue("@Email", model.Email);
                },
                singleRecordMapper: (reader, resultsSetNumber) =>
                {
                    userId = (int)reader["Id"];
                    passwordHash = (string)reader["Password"];
                });

            bool isSuccessful = BCrypt.Net.BCrypt.Verify(model.Password, passwordHash);
            if (isSuccessful)
            {
                UserAuthData userAuthData = new UserAuthData();
                userAuthData.Id = userId;
                authenticationService.Login(userAuthData, rememberMe);
            }
            return isSuccessful;
        }
        
        public UserWithRole GetCurrentUser(int id)
        {
            UserWithRole result = new UserWithRole();
            dataProvider.ExecuteCmd(
                "Users_GetCurrentUser",
                inputParamMapper: parameters =>
                {
                    parameters.AddWithValue("@Id", id);
                },
                singleRecordMapper: (reader, resultsSetNumber) =>
                {
                    result.Id = (int)reader["Id"];
                    result.FirstName = (string)reader["FirstName"];
                    result.LastName = (string)reader["LastName"];
                    result.Email = (string)reader["Email"];
                    result.UserTypeId = reader.GetSafeInt32Nullable("UserTypeId");
                    result.UserTypeName = (string)reader["UserTypeName"];
                    result.Role = reader.GetSafeInt32Nullable("Role");
                    result.AvatarUrl = reader["AvatarUrl"] as string ?? default(string);
                    result.DateCreated = (DateTime)reader["DateCreated"];
                    result.DateModified = (DateTime)reader["DateModified"];
                    result.DisplayName = reader.GetSafeString("DisplayName");
                });
            return result;
        }

        public bool GoogleLogin(GoogleLoginRequest model)
        {
            bool userAuthenticated = false;
            int userId = 0;

            // CLIENT ID REMOVED
            string googleClientId = "";
            string gapiRespObject;
            string gapiAuthUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=";
            HttpWebRequest webReq = (HttpWebRequest)WebRequest.Create(gapiAuthUrl + model.GoogleToken);
            webReq.Method = "GET";
            HttpWebResponse webResp = (HttpWebResponse)webReq.GetResponse();
            using (Stream stream = webResp.GetResponseStream())
            {
                StreamReader reader = new StreamReader(stream, System.Text.Encoding.UTF8);
                gapiRespObject = reader.ReadToEnd();
            }

            var gapiRespString = (JObject)JsonConvert.DeserializeObject(gapiRespObject);
            string authEmail = gapiRespString["email"].Value<string>();
            string authAud = gapiRespString["aud"].Value<string>();
            string authFirstName = gapiRespString["given_name"].Value<string>();
            string authLastName = gapiRespString["family_name"].Value<string>();
            string authPassword = gapiRespString["sub"].Value<string>();

            if (authAud == googleClientId)
            {
                userAuthenticated = true;

                dataProvider.ExecuteCmd(
                "Users_GoogleLogin",
                inputParamMapper: (parameters) =>
                {
                    parameters.AddWithValue("@Email", authEmail);
                    parameters.AddWithValue("@FirstName", authFirstName);
                    parameters.AddWithValue("@LastName", authLastName);
                    parameters.AddWithValue("@UserTypeId", (object)DBNull.Value);
                    parameters.AddWithValue("@Password", authPassword);
                },
                singleRecordMapper: (reader, resultsSetNumber) =>
                {
                    userId = (int)reader["Id"];
                });

                UserAuthData userAuthData = new UserAuthData()
                {
                    Id = userId
                };
                authenticationService.Login(userAuthData, true);
            }
            return userAuthenticated;
        }
    }
}


