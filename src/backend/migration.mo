import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type Category = Text;

  type Registration = {
    category : Category;
    month : Nat;
    location : Text;
    requirements : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    registrationMap : Map.Map<Nat, List.List<Registration>>;
  };

  type UserProfile = {
    name : Text;
  };

  type NewRegistration = {
    id : Nat;
    userId : Text;
    category : Text;
    product : Text;
    name : Text;
    phone : Text;
    location : Text;
    requirements : Text;
    timestamp : Time.Time;
  };

  type NewActor = {
    categoriesMap : Map.Map<Text, [Text]>;
    registrations : List.List<NewRegistration>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      categoriesMap = Map.empty<Text, [Text]>();
      registrations = List.empty<NewRegistration>();
      userProfiles = Map.empty<Principal, UserProfile>();
      nextId = 0;
    };
  };
};
