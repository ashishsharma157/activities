using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Domain;
using Persistence;
using Application.Core;
using Application.Interfaces;

namespace Application.Activities
{
    public class Create
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Activity Activity { get; set; }
        }

        public class CommandValidator:AbstractValidator<Activity>
        {
            public CommandValidator()
            {
                RuleFor(x=>x.Title).NotEmpty();
            }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }
            public async Task<Result<Unit>> Handle(Command Request, CancellationToken cancellationToken)
            {
                var user= _context.Users.FirstOrDefault(x=>x.UserName==_userAccessor.GetUserName());

                var attendee=new ActivityAttendee
                {
                    AppUser=user,
                    Activity=Request.Activity,
                    IsHost=true
                };
                Request.Activity.Attendees.Add(attendee);
                _context.Activities.Add(Request.Activity);
                var result=await _context.SaveChangesAsync()>0;

                if(!result) return Result<Unit>.Failure("Failed to create activity");

                return Result<Unit>.Success(Unit.Value);
            }
        }
    }
}