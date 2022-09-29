using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Domain;
using API.DTO;
using API.Services;
using System.Security.Claims;
using Newtonsoft.Json;

namespace API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _config;

        private readonly HttpClient _httpClient;

        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, TokenService tokenService, IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _config = config;
            _httpClient = new HttpClient
            {
                BaseAddress = new System.Uri("https://graph.facebook.com")
            };
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users.Include(p => p.Photos)
                        .FirstOrDefaultAsync(x => x.Email == loginDto.Email);

            if (user == null) return Unauthorized();

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            if (result.Succeeded)
            {
                // return new UserDto
                // {
                //     DisplayName = user.DisplayName,
                //     Image = user?.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
                //     Token = _tokenService.CreateToken(user),
                //     UserName = user.UserName
                // };
                await SetRefreshToken(user);
                return CreateUserObject(user);
            }

            return Unauthorized();
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto register)
        {
            if (_userManager.Users.Any(x => x.Email == register.Email))
            {
                ModelState.AddModelError("email", "Email taken");
                return ValidationProblem();
            }
            if (_userManager.Users.Any(x => x.UserName == register.UserName))
            {
                ModelState.AddModelError("Username", "username taken");
                return ValidationProblem();
            }

            var user = new AppUser
            {
                DisplayName = register.DisplayName,
                Email = register.Email,
                UserName = register.UserName,
                Bio = "test bio"
            };

            var result = await _userManager.CreateAsync(user, register.Password);

            if (result.Succeeded)
            {
                // return new UserDto
                // {
                //     DisplayName = user.DisplayName,
                //     Image = null,
                //     Token = _tokenService.CreateToken(user),
                //     UserName = user.UserName
                // };
                await SetRefreshToken(user);
                return CreateUserObject(user);
            }

            return BadRequest("Problem in register user");
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.Users.Include(p => p.Photos).FirstOrDefaultAsync(x => x.Email == User.FindFirstValue(ClaimTypes.Email));
            await SetRefreshToken(user);
            return CreateUserObject(user);
        }

        [AllowAnonymous]
        [HttpPost("fbLogin")]
        public async Task<ActionResult<UserDto>> FacebookLogin(string accessToken)
        {
            var fbVerifyKeys = _config["FacebookLAppId"] + "|" + _config["Facebook:AppSecret"];
            var verifyToken = await _httpClient.GetAsync($"debug_token?input_token={accessToken}&access_token{fbVerifyKeys}");

            if (!verifyToken.IsSuccessStatusCode) return Unauthorized();

            var fbUrl = $"me?access_token={accessToken}&name,email,picture.width(100).height(100)";

            var response = await _httpClient.GetAsync(fbUrl);
            if (!response.IsSuccessStatusCode) return Unauthorized();

            var fbInfo = JsonConvert.DeserializeObject<dynamic>(await response.Content.ReadAsStringAsync());
            var username = (string)fbInfo.id;
            var user = await _userManager.Users.Include(p => p.Photos).FirstOrDefaultAsync(x => x.UserName == username);
            if (user != null) return CreateUserObject(user);

            user = new AppUser
            {
                DisplayName = (string)fbInfo.name,
                Email = (string)fbInfo.email,
                UserName = username,
                Photos = new List<Photo> { new Photo { Id = "fb_" + username, Url = (string)fbInfo.picture.data.url, IsMain = true } }
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded) return BadRequest("Problem creating user account");
            await SetRefreshToken(user);
            return CreateUserObject(user);
        }

        [Authorize]
        [HttpPost("refreshToken")]
        public async Task<ActionResult<UserDto>> RefreshToken()
        {
            var refeshToken = Request.Cookies["refreshToken"];
            var user = await _userManager.Users.Include(r => r.RefreshTokens)
            .Include(p => p.Photos)
            .FirstOrDefaultAsync(x => x.UserName == User.FindFirstValue(ClaimTypes.Name));

            if (user == null) return Unauthorized();
            var oldToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refeshToken);
            if (oldToken != null && !oldToken.IsActive) return Unauthorized();

            if (oldToken != null) oldToken.Revoked = DateTime.UtcNow;
            return CreateUserObject(user);
        }
        private async Task SetRefreshToken(AppUser user)
        {
            var refeshToken = _tokenService.GenerateRefreshToken();
            user.RefreshTokens.Add(refeshToken);
            await _userManager.UpdateAsync(user);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", refeshToken.Token, cookieOptions);
        }
        private UserDto CreateUserObject(AppUser user)
        {
            return new UserDto
            {
                DisplayName = user.DisplayName,
                Image = user?.Photos?.FirstOrDefault(x => x.IsMain)?.Url,
                Token = _tokenService.CreateToken(user),
                UserName = user.UserName
            };
        }


    }
}