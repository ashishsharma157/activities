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


namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<Result<List<ActivityDto>>> { }

        public class Handler : IRequestHandler<Query, Result<List<ActivityDto>>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }
            public async Task<Result<List<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var actvities=await _context.Activities
                //.Include(a=>a.Attendees)
                //.ThenInclude(u=>u.AppUser)
                .ProjectTo<ActivityDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

                //var activityToReturn=_mapper.Map<List<ActivityDto>>(actvities);
                //return Result<List<ActivityDto>>.Success(activityToReturn);
                return Result<List<ActivityDto>>.Success(actvities);

            }
        }
    }
}