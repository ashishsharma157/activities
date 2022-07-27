using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Profiles
{
    public class UserActivityParams
    {
        public string Predicate { get; set; }
        public DateTime StartDate {get;set;}=DateTime.UtcNow;
    }
}