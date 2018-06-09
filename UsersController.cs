using Newtonsoft.Json.Linq;
using Models.Domain;
using Models.Requests;
using Models.Responses;
using Services;
using Services.Security;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;

namespace Web.Controllers
{
    public class UsersController : ApiController
    {
        readonly IUsersService usersService;

        public UsersController(IUsersService usersService)
        {
            this.usersService = usersService;
        }

        [Route ("api/users/login"), HttpPost, AllowAnonymous]
        public HttpResponseMessage Login(UserLoginRequest model)
        {
            bool isSuccessful = usersService.Login(model);
            if (model == null)
            {
                ModelState.AddModelError("", "You did not send any body data!");
            }
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
            if (!isSuccessful)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Password does not match");
            }
            return Request.CreateResponse(HttpStatusCode.OK, isSuccessful);
        }

        [Route("api/users/getcurrentuser"), HttpGet]
        public HttpResponseMessage GetCurrentUser()
        {
            var getCurrentUser = User.Identity.GetId().Value;
            var currentUser = usersService.GetCurrentUser(getCurrentUser);
            return Request.CreateResponse(HttpStatusCode.OK, currentUser);
        }
        
        [Route("api/users/googlelogin"), HttpPost, AllowAnonymous]
        public HttpResponseMessage GoogleLogin(GoogleLoginRequest model)
        {
            bool authToken = usersService.GoogleLogin(model);
            if (!authToken)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "User cannot be authenticated");
            }
            return Request.CreateResponse(HttpStatusCode.OK, authToken);
        }
    }
}


           

            
        