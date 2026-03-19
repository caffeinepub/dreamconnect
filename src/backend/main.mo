import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = { name : Text };

  public type ServiceProviderProfile = {
    name : Text;
    businessName : Text;
    category : Text;
    phone : Text;
  };

  public type Registration = {
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

  public type Quote = {
    id : Nat;
    slotKey : Text;
    serviceProviderId : Text;
    providerName : Text;
    businessName : Text;
    title : Text;
    description : Text;
    price : Text;
    timestamp : Time.Time;
  };

  public type ChatMessage = {
    id : Nat;
    slotKey : Text;
    serviceProviderId : Text;
    memberId : Text;
    senderIsProvider : Bool;
    content : Text;
    timestamp : Time.Time;
  };

  // Kept for upgrade compatibility (was previously used)
  let categoriesMap = Map.empty<Text, [Text]>();
  let registrations = List.empty<Registration>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let serviceProviderProfiles = Map.empty<Principal, ServiceProviderProfile>();
  let quotes = List.empty<Quote>();
  let chatMessages = List.empty<ChatMessage>();
  var nextId = 0;
  var nextQuoteId = 0;
  var nextChatId = 0;

  // New state: track which slots (category#product) each service provider has paid for
  let spSlotPayments = Map.empty<Principal, List.List<Text>>();

  func toText(p : Principal) : Text {
    p.toText();
  };

  func makeSlotKey(category : Text, product : Text) : Text {
    category # "_" # product;
  };

  func arrayContains(arr : [Text], value : Text) : Bool {
    for (item in arr.vals()) {
      if (item == value) { return true };
    };
    false;
  };

  func getProductsForCategoryInternal(category : Text) : [Text] {
    switch (category) {
      case ("Electronics") { ["Mobile", "Laptop", "TV", "Refrigerator", "AC", "Washing Machine", "Chimney", "Speakers"] };
      case ("Cars") { ["Hatchback", "Sedan", "SUV", "MUV", "Luxury Car", "Electric Car", "Sports Car", "Pickup Truck"] };
      case ("Interior Designing") { ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Kids Room", "Balcony", "Dining Room"] };
      case ("Furniture") { ["Sofa", "Bed", "Wardrobe", "Dining Table", "Office Chair", "Bookshelf", "TV Unit", "Shoe Rack"] };
      case ("Real Estate") { ["Apartment", "Villa", "Plot", "Commercial Space", "Studio", "Penthouse", "Farmhouse", "Warehouse"] };
      case (_) { [] };
    };
  };

  func ensureRegistered(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
        // First real user becomes admin, rest become regular users
        if (not accessControlState.adminAssigned) {
          accessControlState.userRoles.add(caller, #admin);
          accessControlState.adminAssigned := true;
        } else {
          accessControlState.userRoles.add(caller, #user);
        };
      };
      case (?_) {};
    };
    true;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized") };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or be an admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not ensureRegistered(caller)) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getMyServiceProviderProfile() : async ?ServiceProviderProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    serviceProviderProfiles.get(caller);
  };

  public shared ({ caller }) func registerServiceProvider(profile : ServiceProviderProfile) : async () {
    if (not ensureRegistered(caller)) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    serviceProviderProfiles.add(caller, profile);
  };

  public query func getCategories() : async [Text] {
    ["Electronics", "Cars", "Interior Designing", "Furniture", "Real Estate"];
  };

  public query func getProductsForCategory(category : Text) : async [Text] {
    getProductsForCategoryInternal(category);
  };

  public shared ({ caller }) func registerForProduct(
    category : Text,
    product : Text,
    name : Text,
    phone : Text,
    location : Text,
    requirements : Text,
  ) : async Text {
    if (not ensureRegistered(caller)) {
      Runtime.trap("Unauthorized: Please sign in first");
    };

    let validProducts = getProductsForCategoryInternal(category);
    if (validProducts.size() == 0) {
      Runtime.trap("Invalid category");
    };
    if (not arrayContains(validProducts, product)) {
      Runtime.trap("Invalid product for this category");
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
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    registrations.filter(func(r) { r.userId == toText(caller) }).toArray();
  };

  public query ({ caller }) func getAllRegistrations() : async [Registration] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all registrations");
    };
    registrations.toArray();
  };

  public query ({ caller }) func getSlotMembers(category : Text, product : Text) : async [Registration] {
    // Only authenticated users and service providers can view slot members
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in to view slot members");
    };
    registrations.filter(func(r) { r.category == category and r.product == product }).toArray();
  };

  public shared ({ caller }) func submitQuote(
    category : Text,
    product : Text,
    title : Text,
    description : Text,
    price : Text,
  ) : async () {
    if (not ensureRegistered(caller)) {
      Runtime.trap("Unauthorized: Please sign in");
    };

    // Verify caller is a registered service provider
    let profile = switch (serviceProviderProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Not a registered service provider") };
      case (?p) { p };
    };

    // Verify service provider has paid for this slot
    let slotKey = makeSlotKey(category, product);
    let hasPaid = switch (spSlotPayments.get(caller)) {
      case (null) { false };
      case (?slots) {
        slots.values().any(func(key) { key == slotKey });
      };
    };

    if (not hasPaid) {
      Runtime.trap("Unauthorized: You must pay for this slot before submitting quotes");
    };

    let quote : Quote = {
      id = nextQuoteId;
      slotKey;
      serviceProviderId = toText(caller);
      providerName = profile.name;
      businessName = profile.businessName;
      title;
      description;
      price;
      timestamp = Time.now();
    };
    quotes.add(quote);
    nextQuoteId += 1;
  };

  public query ({ caller }) func getQuotesForSlot(category : Text, product : Text) : async [Quote] {
    // Only authenticated users can view quotes
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in to view quotes");
    };
    let slotKey = makeSlotKey(category, product);
    quotes.filter(func(q) { q.slotKey == slotKey }).toArray();
  };

  public shared ({ caller }) func sendChatMessage(
    category : Text,
    product : Text,
    serviceProviderId : Text,
    content : Text,
    senderIsProvider : Bool,
  ) : async () {
    if (not ensureRegistered(caller)) {
      Runtime.trap("Unauthorized: Please sign in");
    };

    let slotKey = makeSlotKey(category, product);
    let callerId = toText(caller);

    if (senderIsProvider) {
      Runtime.trap("Use sendChatMessageAsProvider for service providers");
    };

    // Verify the caller is a registered member of this slot
    let isRegistered = registrations.values().any(func(r) {
      r.userId == callerId and r.category == category and r.product == product
    });

    if (not isRegistered) {
      Runtime.trap("Unauthorized: You must be registered for this slot to send messages");
    };

    let msg : ChatMessage = {
      id = nextChatId;
      slotKey;
      serviceProviderId;
      memberId = callerId;
      senderIsProvider = false;
      content;
      timestamp = Time.now();
    };
    chatMessages.add(msg);
    nextChatId += 1;
  };

  public shared ({ caller }) func sendChatMessageAsProvider(
    category : Text,
    product : Text,
    memberId : Text,
    content : Text,
  ) : async () {
    if (not ensureRegistered(caller)) {
      Runtime.trap("Unauthorized: Please sign in");
    };

    // Verify caller is a registered service provider
    let _profile = switch (serviceProviderProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Not a registered service provider") };
      case (?p) { p };
    };

    // Verify service provider has paid for this slot
    let slotKey = makeSlotKey(category, product);
    let hasPaid = switch (spSlotPayments.get(caller)) {
      case (null) { false };
      case (?slots) {
        slots.values().any(func(key) { key == slotKey });
      };
    };

    if (not hasPaid) {
      Runtime.trap("Unauthorized: You must pay for this slot before sending messages");
    };

    let msg : ChatMessage = {
      id = nextChatId;
      slotKey;
      serviceProviderId = toText(caller);
      memberId;
      senderIsProvider = true;
      content;
      timestamp = Time.now();
    };
    chatMessages.add(msg);
    nextChatId += 1;
  };

  public query ({ caller }) func getChatMessages(
    category : Text,
    product : Text,
    serviceProviderId : Text,
  ) : async [ChatMessage] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };
    let slotKey = makeSlotKey(category, product);
    let callerId = toText(caller);

    // User can only see their own chat messages with a specific provider
    chatMessages.filter(func(m) {
      m.slotKey == slotKey and
      m.serviceProviderId == serviceProviderId and
      (m.memberId == callerId or m.serviceProviderId == callerId)
    }).toArray();
  };

  public query ({ caller }) func getProviderChatMessages(
    category : Text,
    product : Text,
    memberId : Text,
  ) : async [ChatMessage] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };

    // Verify caller is a service provider
    switch (serviceProviderProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Not a registered service provider") };
      case (?_) {};
    };

    let slotKey = makeSlotKey(category, product);
    let callerId = toText(caller);

    // Provider can only see messages where they are the service provider
    chatMessages.filter(func(m) {
      m.slotKey == slotKey and
      m.serviceProviderId == callerId and
      m.memberId == memberId
    }).toArray();
  };

  // New function: record SP slot payment (category + product)
  public shared ({ caller }) func recordSpSlotPayment(category : Text, product : Text) : async () {
    if (not ensureRegistered(caller)) {
      Runtime.trap("Unauthorized: Please sign in");
    };

    // Verify caller is a registered service provider
    switch (serviceProviderProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: You must be a registered service provider to pay for slots") };
      case (?_) {};
    };

    // Validate category and product using hardcoded logic
    let validProducts = getProductsForCategoryInternal(category);
    if (validProducts.size() == 0) {
      Runtime.trap("Invalid category");
    };
    if (not arrayContains(validProducts, product)) {
      Runtime.trap("Invalid product for this category");
    };

    let slotKey = makeSlotKey(category, product);

    // Add the slot key to the service provider's paid slots (no deduplication)
    let currentList = switch (spSlotPayments.get(caller)) {
      case (null) { List.empty<Text>() };
      case (?list) { list };
    };
    currentList.add(slotKey);
    spSlotPayments.add(caller, currentList);
  };

  // New query: check if the caller has paid for a specific slot
  public query ({ caller }) func hasSpPaidForSlot(category : Text, product : Text) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please sign in");
    };

    let slotKey = makeSlotKey(category, product);
    switch (spSlotPayments.get(caller)) {
      case (null) { false };
      case (?slots) {
        slots.values().any(func(key) { key == slotKey });
      };
    };
  };
};
