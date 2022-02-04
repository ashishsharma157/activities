using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Persistence;
using Domain;


namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    {

        [HttpGet]
        public async Task<ActionResult<List<Activity>>> GetActivites()
        {
            //return await _context.Activities.ToListAsync();
            return await Mediator.Send(new Application.Activities.List.Query());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Activity>> GetActivity(Guid id)
        {
            return await Mediator.Send(new Application.Activities.Details.Query { Id = id });

        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity(Activity activity)
        {
            return Ok(await Mediator.Send(new Application.Activities.Create.Command { Activity = activity }));
        }

        [HttpPut("{Id}")]
        public async Task<IActionResult> EditActivity(Guid id, Activity activity)
        {
            activity.Id = id;
            return Ok(await Mediator.Send(new Application.Activities.Edit.Command { Activity = activity }));
        }

        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteActivity(Guid id)
        {
            return Ok(await Mediator.Send(new Application.Activities.Delete.Command { Id = id }));
        }
    }
}