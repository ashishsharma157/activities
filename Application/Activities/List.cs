using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Domain;
using Persistence;
using Application.Core;
using Microsoft.EntityFrameworkCore;
using AutoMapper.QueryableExtensions;
using Application.Interfaces;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<Result<PageList<ActivityDto>>> {

            public ActivityParams Params { get; set; }
         }

        public class Handler : IRequestHandler<Query, Result<PageList<ActivityDto>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _context = context;
                _mapper = mapper;
                _userAccessor = userAccessor;
            }
            public async Task<Result<PageList<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query =  _context.Activities
                .Where(d=>d.Date>=request.Params.StartDate)
                .OrderBy(d=>d.Date)
                //.Include(a=>a.Attendees)
                //.ThenInclude(u=>u.AppUser)
                .ProjectTo<ActivityDto>(_mapper.ConfigurationProvider, new { currentuser = _userAccessor.GetUserName() })
                .AsQueryable();
                //.ToListAsync(cancellationToken);

                if(request.Params.IsGoing && !request.Params.IsHost)
                {
                    query=query.Where(x=>x.Attendees.Any(a=>a.Username==_userAccessor.GetUserName()));
                }

                if(request.Params.IsHost && !request.Params.IsGoing)
                {
                    query=query.Where(x=>x.HostUserName==_userAccessor.GetUserName());
                }

                //var activityToReturn=_mapper.Map<List<ActivityDto>>(actvities);
                //return Result<List<ActivityDto>>.Success(activityToReturn);
                return Result<PageList<ActivityDto>>.Success(await PageList<ActivityDto>.CreateAsync(query, request.Params.PageNumber,
                     request.Params.PageSize));

            }
        }
    }
}