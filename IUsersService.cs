using Models.Domain;
using Models.Requests;
using System.Collections.Generic;

namespace Services
{
    public interface IUsersService
    {
        bool Login(UserLoginRequest model);
        User GetById(int id);
        bool GoogleLogin(GoogleLoginRequest model);
    }
}