using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Domain;
using API.DTO;
using API.Services;
using System.Security.Claims;


namespace API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController:ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly TokenService _tokenService;

        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, TokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user=await _userManager.FindByEmailAsync(loginDto.Email);

            if(user==null) return Unauthorized();

            var result= await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if(result.Succeeded)
            {
                return new UserDto
                {
                    DisplayName=user.DisplayName,
                    Image=null,
                    Token=_tokenService.CreateToken(user),
                    UserName=user.UserName
                };
            }

            return Unauthorized();
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto register)
        {
            if(_userManager.Users.Any(x=>x.Email==register.Email))
            {
                return BadRequest("Email taken");
            }
            if(_userManager.Users.Any(x=>x.UserName==register.UserName))
            {
                return BadRequest("User name taken");
            }

            var user=new AppUser{
                DisplayName=register.DisplayName,
                Email=register.Email,
                UserName=register.UserName,
                Bio="test bio"
            };

            var result=await _userManager.CreateAsync(user, register.Password);

            if(result.Succeeded)
            {
                return new UserDto{
                    DisplayName=user.DisplayName,
                    Image=null,
                    Token=_tokenService.CreateToken(user),
                    UserName=user.UserName
                };
            }

            return BadRequest("Problem in register user");
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user= await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            return CreateUserObject(user);
        }

        private UserDto CreateUserObject(AppUser user)
        {
                return new UserDto{
                    DisplayName=user.DisplayName,
                    Image=null,
                    Token=_tokenService.CreateToken(user),
                    UserName=user.UserName
                };
        }
    }
}