using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace API.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class ValuesController : ControllerBase
  {

    private readonly DataContext _context;

    public ValuesController(DataContext context)
    {
      _context = context;
    }

    // GET api/values
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Value>>> Get()
    {
      var values = await _context.Values.ToListAsync();
      return Ok(values);
    }

    // GET api/values/5
    [HttpGet("{id}")]
    public ActionResult<string> Get(int id)
    {
      return "value";
    }
  }
}