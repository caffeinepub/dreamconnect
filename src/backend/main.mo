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

  public type CustomSlot = {
    id : Nat;
    title : Text;
    category : Text;
    description : Text;
    location : Text;
    creatorId : Text;
    maxMembers : Nat;
    createdAt : Time.Time;
  };

  public type CustomSlotMember = {
    slotId : Nat;
    userId : Text;
    name : Text;
    phone : Text;
    location : Text;
    requirements : Text;
    joinedAt : Time.Time;
  };

  public type PublicRegistration = {
    product : Text;
    location : Text;
  };

  // ── Stable storage (survives upgrades / redeployments) ──────────────────────────────────────────────
  stable var stableRegistrations         : [Registration]                   = [];
  stable var stableQuotes                : [Quote]                          = [];
  stable var stableChatMessages          : [ChatMessage]                    = [];
  stable var stableUserProfiles          : [(Principal, UserProfile)]       = [];
  stable var stableSPProfiles            : [(Principal, ServiceProviderProfile)] = [];
  stable var stableSpSlotPayments        : [(Principal, [Text])]            = [];
  stable var stableNextId                : Nat                              = 0;
  stable var stableNextQuoteId           : Nat                              = 0;
  stable var stableNextChatId            : Nat                              = 0;
  stable var stableCustomSlots           : [CustomSlot]                     = [];
  stable var stableCustomSlotMembers     : [CustomSlotMember]               = [];
  stable var stableNextCustomSlotId      : Nat                              = 0;

  // ── In-memory working state (rebuilt from stable on every install) ─────────────────────────────────────────
  let registrations          = List.empty<Registration>();
  let userProfiles           = Map.empty<Principal, UserProfile>();
  let serviceProviderProfiles = Map.empty<Principal, ServiceProviderProfile>();
  let quotes                 = List.empty<Quote>();
  let chatMessages           = List.empty<ChatMessage>();
  var nextId                 = stableNextId;
  var nextQuoteId            = stableNextQuoteId;
  var nextChatId             = stableNextChatId;
  let categoriesMap = Map.empty<Text, [Text]>(); // kept for upgrade compatibility
  let spSlotPayments         = Map.empty<Principal, List.List<Text>>();
  let customSlots            = List.empty<CustomSlot>();
  let customSlotMembers      = List.empty<CustomSlotMember>();
  var nextCustomSlotId       = stableNextCustomSlotId;

  // Restore on every install/upgrade
  for (r   in stableRegistrations.vals())        { registrations.add(r) };
  for (q   in stableQuotes.vals())               { quotes.add(q) };
  for (m   in stableChatMessages.vals())         { chatMessages.add(m) };
  for ((p, prof) in stableUserProfiles.vals())   { userProfiles.add(p, prof) };
  for ((p, prof) in stableSPProfiles.vals())     { serviceProviderProfiles.add(p, prof) };
  for ((p, slots) in stableSpSlotPayments.vals()) {
    let lst = List.empty<Text>();
    for (s in slots.vals()) { lst.add(s) };
    spSlotPayments.add(p, lst);
  };
  for (cs  in stableCustomSlots.vals())          { customSlots.add(cs) };
  for (csm in stableCustomSlotMembers.vals())    { customSlotMembers.add(csm) };

  // Persist to stable vars before any upgrade
  system func preupgrade() {
    stableRegistrations  := registrations.toArray();
    stableQuotes         := quotes.toArray();
    stableChatMessages   := chatMessages.toArray();
    stableNextId         := nextId;
    stableNextQuoteId    := nextQuoteId;
    stableNextChatId     := nextChatId;
    stableCustomSlots    := customSlots.toArray();
    stableCustomSlotMembers := customSlotMembers.toArray();
    stableNextCustomSlotId := nextCustomSlotId;

    // Serialize userProfiles map
    let upBuf = List.empty<(Principal, UserProfile)>();
    for ((p, prof) in userProfiles.entries()) { upBuf.add((p, prof)) };
    stableUserProfiles := upBuf.toArray();

    // Serialize serviceProviderProfiles map
    let spBuf = List.empty<(Principal, ServiceProviderProfile)>();
    for ((p, prof) in serviceProviderProfiles.entries()) { spBuf.add((p, prof)) };
    stableSPProfiles := spBuf.toArray();

    // Serialize spSlotPayments map
    let payBuf = List.empty<(Principal, [Text])>();
    for ((p, lst) in spSlotPayments.entries()) { payBuf.add((p, lst.toArray())) };
    stableSpSlotPayments := payBuf.toArray();
  };

  system func postupgrade() {};

  // ── Helpers ────────────────────────────────────────────────────────────────────────────────────

  func toText(p : Principal) : Text { p.toText() };

  func makeSlotKey(category : Text, product : Text) : Text { category # "_" # product };

  func arrayContains(arr : [Text], value : Text) : Bool {
    for (item in arr.vals()) { if (item == value) { return true } };
    false;
  };

  func getProductsForCategoryInternal(category : Text) : [Text] {
    switch (category) {
      // Merged Electronics & Appliances
      case ("Electronics & Appliances") {
        [
          "Mobile", "Laptop", "TV", "Speakers", "Camera", "Headphones", "Smartwatch", "Gaming Console",
          "Refrigerator", "Washing Machine", "AC", "Microwave", "Geyser", "Dishwasher",
          "Water Purifier", "Chimney", "Air Purifier", "Oven"
        ]
      };
      // Backward compatibility for old registrations
      case ("Electronics") {
        ["Mobile", "Laptop", "TV", "Speakers", "Camera", "Headphones", "Smartwatch", "Gaming Console"]
      };
      case ("Appliances") {
        ["Refrigerator", "Washing Machine", "AC", "Microwave", "Geyser", "Dishwasher", "Water Purifier", "Chimney", "Air Purifier", "Oven"]
      };
      // Vehicles with type-prefixed brands
      case ("Vehicles") {
        [
          "Car - Maruti Suzuki", "Car - Hyundai", "Car - Tata", "Car - Honda",
          "Car - Toyota", "Car - Mahindra", "Car - Kia", "Car - Skoda", "Car - MG", "Car - Volkswagen",
          "Bike - Royal Enfield", "Bike - Bajaj", "Bike - Hero", "Bike - TVS",
          "Bike - Honda", "Bike - Yamaha", "Bike - KTM",
          "Truck - Tata", "Truck - Ashok Leyland", "Truck - Mahindra", "Truck - Eicher",
          "Bus - Volvo", "Bus - Tata", "Bus - Ashok Leyland",
          "Heavy Equipment - JCB", "Heavy Equipment - CAT", "Heavy Equipment - Komatsu", "Heavy Equipment - Escorts",
          "Three Wheeler - Bajaj", "Three Wheeler - Piaggio", "Three Wheeler - TVS"
        ]
      };
      case ("Interior Designing")       { ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Kids Room", "Balcony", "Dining Room"] };
      case ("Furniture")                { ["Sofa", "Bed", "Wardrobe", "Dining Table", "Office Chair", "Bookshelf", "TV Unit", "Shoe Rack"] };
      case ("Real Estate")              { ["Apartment", "Villa", "Plot", "Commercial Space", "Studio", "Penthouse", "Farmhouse", "Warehouse"] };
      case ("Gym")                      { ["Treadmill", "Dumbbells", "Bench Press", "Elliptical", "Rowing Machine", "Pull-up Bar", "Resistance Bands", "Yoga Mat", "Exercise Bike", "Kettlebells"] };
      case ("Courses")                  { ["Programming", "Design", "Digital Marketing", "Finance", "Language", "Photography", "Music", "Cooking", "Fitness", "Business"] };
      case ("Medical")                  { ["General Physician", "Dentist", "Physiotherapy", "Eye Care", "Skin Care", "Diagnostics", "Nursing Care", "Mental Health", "Nutrition", "Paediatrics"] };
      case ("Beauty")                   { ["Hair Care", "Skin Care", "Makeup", "Nail Care", "Spa", "Waxing", "Bridal Package", "Massage", "Facial", "Eyebrow Threading"] };
      case ("Construction Materials")   { ["Cement", "Steel", "Bricks", "Sand", "Tiles", "Paint", "Glass", "Plywood", "Pipes", "Electrical Fittings"] };
      case ("Business Services")        { ["Accounting", "Legal", "HR", "IT Support", "Marketing", "Logistics", "Printing", "Security", "Cleaning", "Consulting"] };
      case ("Decor")                    { ["Curtains", "Rugs", "Lighting", "Wall Art", "Planters", "Cushions", "Mirrors", "Clocks", "Photo Frames", "Vases"] };
      case (_)                          { [] };
    };
  };

  func ensureRegistered(caller : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
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

  // ── User profiles ────────────────────────────────────────────────────────────────────────────────────

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
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in") };
    userProfiles.add(caller, profile);
  };

  // ── Service provider profiles ──────────────────────────────────────────────────────────────────────────────────────

  public query ({ caller }) func getMyServiceProviderProfile() : async ?ServiceProviderProfile {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Please sign in") };
    serviceProviderProfiles.get(caller);
  };

  public shared ({ caller }) func registerServiceProvider(profile : ServiceProviderProfile) : async () {
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in") };
    serviceProviderProfiles.add(caller, profile);
  };

  // ── Categories & products ──────────────────────────────────────────────────────────────────────────────────────

  public query func getCategories() : async [Text] {
    ["Electronics & Appliances", "Vehicles", "Interior Designing", "Furniture", "Real Estate", "Gym", "Courses", "Medical", "Beauty", "Construction Materials", "Business Services", "Decor"];
  };

  public query func getProductsForCategory(category : Text) : async [Text] {
    getProductsForCategoryInternal(category);
  };

  // ── Registrations ─────────────────────────────────────────────────────────────────────────────────────

  public shared ({ caller }) func registerForProduct(
    category : Text,
    product : Text,
    name : Text,
    phone : Text,
    location : Text,
    requirements : Text,
  ) : async Text {
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in first") };

    let validProducts = getProductsForCategoryInternal(category);
    if (validProducts.size() == 0) { Runtime.trap("Invalid category") };
    if (not arrayContains(validProducts, product)) { Runtime.trap("Invalid product for this category") };

    let count = registrations.filter(func(r) { r.category == category and r.product == product }).size();
    if (count >= 20) { Runtime.trap("Product registration limit reached") };

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
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Please sign in") };
    registrations.filter(func(r) { r.userId == toText(caller) }).toArray();
  };

  public query ({ caller }) func getAllRegistrations() : async [Registration] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all registrations");
    };
    registrations.toArray();
  };

  public query ({ caller }) func getSlotMembers(category : Text, product : Text) : async [Registration] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Please sign in to view slot members") };
    registrations.filter(func(r) { r.category == category and r.product == product }).toArray();
  };

  public query func getPublicRegistrationsForCategory(category : Text) : async [PublicRegistration] {
    let filtered = registrations.filter(func(r) { r.category == category });
    let mapped = List.empty<PublicRegistration>();
    for (r in filtered.values()) { mapped.add({ product = r.product; location = r.location }) };
    mapped.toArray();
  };

  // ── Quotes ───────────────────────────────────────────────────────────────────────────────────────

  public shared ({ caller }) func submitQuote(
    category : Text,
    product : Text,
    title : Text,
    description : Text,
    price : Text,
  ) : async () {
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in") };

    let profile = switch (serviceProviderProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Not a registered service provider") };
      case (?p)   { p };
    };

    let slotKey = makeSlotKey(category, product);
    let hasPaid = switch (spSlotPayments.get(caller)) {
      case (null)  { false };
      case (?slots) { slots.values().any(func(key) { key == slotKey }) };
    };
    if (not hasPaid) { Runtime.trap("Unauthorized: You must pay for this slot before submitting quotes") };

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
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Please sign in to view quotes") };
    let slotKey = makeSlotKey(category, product);
    quotes.filter(func(q) { q.slotKey == slotKey }).toArray();
  };

  // ── Chat ────────────────────────────────────────────────────────────────────────────────────────

  public shared ({ caller }) func sendChatMessage(
    category : Text,
    product : Text,
    serviceProviderId : Text,
    content : Text,
    senderIsProvider : Bool,
  ) : async () {
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in") };

    if (senderIsProvider) { Runtime.trap("Use sendChatMessageAsProvider for service providers") };

    let slotKey = makeSlotKey(category, product);
    let callerId = toText(caller);

    let isRegistered = registrations.values().any(func(r) {
      r.userId == callerId and r.category == category and r.product == product
    });
    if (not isRegistered) { Runtime.trap("Unauthorized: You must be registered for this slot to send messages") };

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
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in") };

    let _profile = switch (serviceProviderProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Not a registered service provider") };
      case (?p)   { p };
    };

    let slotKey = makeSlotKey(category, product);
    let hasPaid = switch (spSlotPayments.get(caller)) {
      case (null)  { false };
      case (?slots) { slots.values().any(func(key) { key == slotKey }) };
    };
    if (not hasPaid) { Runtime.trap("Unauthorized: You must pay for this slot before sending messages") };

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
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Please sign in") };
    let slotKey = makeSlotKey(category, product);
    let callerId = toText(caller);
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
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Please sign in") };
    switch (serviceProviderProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: Not a registered service provider") };
      case (?_)   {};
    };
    let slotKey = makeSlotKey(category, product);
    let callerId = toText(caller);
    chatMessages.filter(func(m) {
      m.slotKey == slotKey and
      m.serviceProviderId == callerId and
      m.memberId == memberId
    }).toArray();
  };

  // ── Service provider slot payments ───────────────────────────────────────────────────────────────────────────

  public shared ({ caller }) func recordSpSlotPayment(category : Text, product : Text) : async () {
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in") };
    switch (serviceProviderProfiles.get(caller)) {
      case (null) { Runtime.trap("Unauthorized: You must be a registered service provider to pay for slots") };
      case (?_)   {};
    };
    let validProducts = getProductsForCategoryInternal(category);
    if (validProducts.size() == 0) { Runtime.trap("Invalid category") };
    if (not arrayContains(validProducts, product)) { Runtime.trap("Invalid product for this category") };
    let slotKey = makeSlotKey(category, product);
    let currentList = switch (spSlotPayments.get(caller)) {
      case (null)  { List.empty<Text>() };
      case (?list) { list };
    };
    currentList.add(slotKey);
    spSlotPayments.add(caller, currentList);
  };

  public query ({ caller }) func hasSpPaidForSlot(category : Text, product : Text) : async Bool {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Please sign in") };
    let slotKey = makeSlotKey(category, product);
    switch (spSlotPayments.get(caller)) {
      case (null)  { false };
      case (?slots) { slots.values().any(func(key) { key == slotKey }) };
    };
  };

  // ── Custom Slots ─────────────────────────────────────────────────────────────────────────────────

  public shared ({ caller }) func createCustomSlot(
    title : Text,
    category : Text,
    description : Text,
    location : Text,
    maxMembers : Nat,
    creatorName : Text,
    creatorPhone : Text,
    creatorRequirements : Text,
  ) : async Nat {
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in") };
    if (title.size() == 0) { Runtime.trap("Title cannot be empty") };
    if (location.size() == 0) { Runtime.trap("Location cannot be empty") };
    if (creatorName.size() == 0) { Runtime.trap("Your name cannot be empty") };
    if (creatorPhone.size() == 0) { Runtime.trap("Your phone cannot be empty") };
    let cappedMax = if (maxMembers > 50) { 50 } else if (maxMembers < 2) { 2 } else { maxMembers };
    let slotId = nextCustomSlotId;
    let slot : CustomSlot = {
      id = slotId;
      title;
      category;
      description;
      location;
      creatorId = toText(caller);
      maxMembers = cappedMax;
      createdAt = Time.now();
    };
    customSlots.add(slot);
    nextCustomSlotId += 1;
    // Atomically add creator as first member
    let member : CustomSlotMember = {
      slotId;
      userId = toText(caller);
      name = creatorName;
      phone = creatorPhone;
      location;
      requirements = creatorRequirements;
      joinedAt = Time.now();
    };
    customSlotMembers.add(member);
    slotId;
  };

  public query func getCustomSlots() : async [CustomSlot] {
    customSlots.toArray();
  };

  public query func getCustomSlotsForCategory(category : Text) : async [CustomSlot] {
    customSlots.filter(func(s) { s.category == category }).toArray();
  };

  public shared ({ caller }) func joinCustomSlot(
    slotId : Nat,
    name : Text,
    phone : Text,
    location : Text,
    requirements : Text,
  ) : async Text {
    if (not ensureRegistered(caller)) { Runtime.trap("Unauthorized: Please sign in") };
    if (name.size() == 0) { Runtime.trap("Name cannot be empty") };
    if (phone.size() == 0) { Runtime.trap("Phone cannot be empty") };
    if (location.size() == 0) { Runtime.trap("Location cannot be empty") };

    // Find the slot
    var found = false;
    var maxMembers : Nat = 0;
    for (s in customSlots.values()) {
      if (s.id == slotId) {
        found := true;
        maxMembers := s.maxMembers;
      };
    };
    if (not found) { Runtime.trap("Slot not found") };

    let callerId = toText(caller);

    // Check already a member
    let alreadyMember = customSlotMembers.values().any(func(m) {
      m.slotId == slotId and m.userId == callerId
    });
    if (alreadyMember) { Runtime.trap("You are already a member of this slot") };

    // Check capacity
    let currentCount = customSlotMembers.filter(func(m) { m.slotId == slotId }).size();
    if (currentCount >= maxMembers) { Runtime.trap("Slot is full") };

    let member : CustomSlotMember = {
      slotId;
      userId = callerId;
      name;
      phone;
      location;
      requirements;
      joinedAt = Time.now();
    };
    customSlotMembers.add(member);
    "Joined slot successfully";
  };

  public query ({ caller }) func getCustomSlotMembers(slotId : Nat) : async [CustomSlotMember] {
    if (caller.isAnonymous()) { Runtime.trap("Unauthorized: Please sign in") };
    customSlotMembers.filter(func(m) { m.slotId == slotId }).toArray();
  };

  public query ({ caller }) func isCustomSlotMember(slotId : Nat) : async Bool {
    if (caller.isAnonymous()) { return false };
    let callerId = toText(caller);
    customSlotMembers.values().any(func(m) {
      m.slotId == slotId and m.userId == callerId
    });
  };

  public query func getCustomSlotMemberCount(slotId : Nat) : async Nat {
    customSlotMembers.filter(func(m) { m.slotId == slotId }).size();
  };
};
