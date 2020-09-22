using Domain;

namespace Application.Interfaces
{
  public interface IJwtGenerator
  {
    string Createtoken(AppUser user);
  }
}