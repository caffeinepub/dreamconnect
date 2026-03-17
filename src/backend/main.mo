import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Migration "migration";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = { name : Text };

  type Registration = {
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

  let categoriesMap = Map.empty<Text, [Text]>();
  let registrations = List.empty<Registration>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextId = 0;

  func toText(p : Principal) : Text {
    p.toText();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func initialize() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can initialize");
    };

    categoriesMap.add("Electronics", ["Mobile", "Laptop", "TV", "Refrigerator", "AC", "Washing Machine", "Chimney", "Speakers"]);
    categoriesMap.add("Cars", ["Hatchback", "Sedan", "SUV", "MUV", "Luxury Car", "Electric Car", "Sports Car", "Pickup Truck"]);
    categoriesMap.add("Interior Designing", ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Kids Room", "Balcony", "Dining Room"]);
    categoriesMap.add("Furniture", ["Sofa", "Bed", "Wardrobe", "Dining Table", "Office Chair", "Bookshelf", "TV Unit", "Shoe Rack"]);
    categoriesMap.add("Real Estate", ["Apartment", "Villa", "Plot", "Commercial Space", "Studio", "Penthouse", "Farmhouse", "Warehouse"]);
  };

  public shared ({ caller }) func registerForProduct(
    category : Text,
    product : Text,
    name : Text,
    phone : Text,
    location : Text,
    requirements : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    switch (categoriesMap.get(category)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?products) {
        if (products.find(func(p) { p == product }) == null) {
          Runtime.trap("Product does not exist in this category");
        };
      };
    };

    let count = registrations.filter(func(r) { r.category == category and r.product == product }).size();

    if (count >= 20) {
      Runtime.trap("Product registration limit reached");
    };

    let registration : Registration = {
      id = nextId;
      userId = toText(caller);
      category;
      product;
      name;
      phone;
      location;
      requirements;
      timestamp = Time.now();
    };

    registrations.add(registration);
    nextId += 1;
    "Registration successful";
  };

  public query func getProductCount(category : Text, product : Text) : async Nat {
    registrations.filter(func(r) { r.category == category and r.product == product }).size();
  };

  public query ({ caller }) func getMyRegistrations() : async [Registration] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their registrations");
    };
    registrations.filter(func(r) { r.userId == toText(caller) }).toArray();
  };

  public query ({ caller }) func getAllRegistrations() : async [Registration] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all registrations");
    };
    registrations.toArray();
  };

  public query func getCategories() : async [Text] {
    categoriesMap.keys().toArray();
  };

  public query func getProductsForCategory(category : Text) : async [Text] {
    switch (categoriesMap.get(category)) {
      case (null) { [] };
      case (?products) { products };
    };
  };
};
