using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Domain;
using Application.Activities;
using Application.Comments;


namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Activity, Activity>();

            CreateMap<ActivityAttendee, AttendDto>()
                .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.AppUser.DisplayName))
                .ForMember(d => d.Username, o => o.MapFrom(s => s.AppUser.UserName))
                .ForMember(d => d.Bio, o => o.MapFrom(s => s.AppUser.Bio))
                .ForMember(d=>d.Image, o=>o.MapFrom(s=>s.AppUser.Photos.FirstOrDefault(x=>x.IsMain).Url));

            CreateMap<Activity, ActivityDto>()
            .ForMember(d => d.HostUserName, o => o.MapFrom(s => s.Attendees
                    .FirstOrDefault(x => x.IsHost).AppUser.UserName));
                    
            CreateMap<AppUser, Application.Profiles.Profile>()
                .ForMember(d=>d.Username, o=>o.MapFrom(s=>s.UserName))
                .ForMember(d=>d.Image, o=>o.MapFrom(s=>s.Photos.FirstOrDefault(x=>x.IsMain).Url));
            //.ForMember(d=>d.Image, o=>o.MapFrom(s=>s.AppUser.Image));

            CreateMap<Comment, CommentDto>()
                .ForMember(d => d.DisplayName, o => o.MapFrom(s => s.Author.DisplayName))
                .ForMember(d => d.Username, o => o.MapFrom(s => s.Author.UserName))
                .ForMember(d=>d.Image, o=>o.MapFrom(s=>s.Author.Photos.FirstOrDefault(x=>x.IsMain).Url));


        }
    }
}