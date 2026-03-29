import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import List "mo:core/List";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Seed data types
  type Subject = {
    id : Text;
    title : Text;
    chapters : [Chapter];
  };

  type Chapter = {
    number : Nat;
    title : Text;
    notes : Text;
    mcqs : [MCQ];
  };

  type MCQ = {
    question : Text;
    options : [Text];
    correctIndex : Nat;
  };

  type SamplePaper = {
    id : Text;
    title : Text;
    subject : Text;
    year : Nat;
    description : Text;
  };

  module SamplePaper {
    public func compare(paper1 : SamplePaper, paper2 : SamplePaper) : Order.Order {
      Text.compare(paper1.id, paper2.id);
    };
  };

  // User data types
  public type UserStudyTask = {
    taskId : Text;
    title : Text;
    subject : Text;
    completed : Bool;
    timestamp : Time.Time;
  };

  module UserStudyTask {
    public func compare(task1 : UserStudyTask, task2 : UserStudyTask) : Order.Order {
      task1.taskId.compare(task2.taskId);
    };
  };

  public type QuizAttempt = {
    attemptId : Text;
    subject : Text;
    chapter : Text;
    score : Nat;
    totalQuestions : Nat;
    timestamp : Time.Time;
  };

  module QuizAttempt {
    public func compare(attempt1 : QuizAttempt, attempt2 : QuizAttempt) : Order.Order {
      attempt1.attemptId.compare(attempt2.attemptId);
    };
  };

  public type ForumPost = {
    postId : Text;
    title : Text;
    body : Text;
    subject : Text;
    author : Principal;
    timestamp : Time.Time;
    replies : [ForumReply];
  };

  module ForumPost {
    public func compare(post1 : ForumPost, post2 : ForumPost) : Order.Order {
      post1.postId.compare(post2.postId);
    };
  };

  public type ForumReply = {
    replyId : Text;
    postId : Text;
    body : Text;
    author : Principal;
    timestamp : Time.Time;
  };

  module ForumReply {
    public func compare(reply1 : ForumReply, reply2 : ForumReply) : Order.Order {
      reply1.replyId.compare(reply2.replyId);
    };
  };

  public type UserProfile = {
    name : Text;
    bio : ?Text;
  };

  module UserProfile {
    public func compare(profile1 : UserProfile, profile2 : UserProfile) : Order.Order {
      profile1.name.compare(profile2.name);
    };
  };

  // Actor state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let subjects = Map.empty<Text, Subject>();
  let samplePapers = Map.empty<Text, SamplePaper>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userTasks = Map.empty<Principal, List.List<UserStudyTask>>();
  let quizAttempts = Map.empty<Principal, List.List<QuizAttempt>>();
  let forumPosts = Map.empty<Text, ForumPost>();

  // ----------------- Subject & Chapter Logic -----------------

  // Query all subjects - accessible to all including guests
  public query ({ caller }) func getSubjects() : async [Subject] {
    subjects.values().toArray();
  };

  // Get specific subject - accessible to all including guests
  public query ({ caller }) func getSubjectById(id : Text) : async ?Subject {
    subjects.get(id);
  };

  // Get specific chapter from a subject - accessible to all including guests
  public query ({ caller }) func getChapter(subjectId : Text, chapterNumber : Nat) : async ?Chapter {
    switch (subjects.get(subjectId)) {
      case (null) { null };
      case (?subject) {
        subject.chapters.find(
          func(chapter) { chapter.number == chapterNumber }
        );
      };
    };
  };

  // Get MCQ for a chapter - accessible to all including guests
  public query ({ caller }) func getChapterMCQs(subjectId : Text, chapterNumber : Nat) : async ?[MCQ] {
    switch (subjects.get(subjectId)) {
      case (null) { null };
      case (?subject) {
        switch (subject.chapters.find(func(chapter) { chapter.number == chapterNumber })) {
          case (null) { null };
          case (?chapter) { ?chapter.mcqs };
        };
      };
    };
  };

  // ----------------- Sample Papers -----------------

  // Accessible to all including guests
  public query ({ caller }) func getAllSamplePapers() : async [SamplePaper] {
    samplePapers.values().toArray().sort();
  };

  // Accessible to all including guests
  public query ({ caller }) func getSamplePapersBySubject(subject : Text) : async [SamplePaper] {
    samplePapers.values().toArray().filter(
      func(paper) { paper.subject == subject }
    ).sort();
  };

  // Accessible to all including guests
  public query ({ caller }) func getSamplePaperById(id : Text) : async ?SamplePaper {
    samplePapers.get(id);
  };

  // ----------------- Study Tasks -----------------

  public shared ({ caller }) func addStudyTask(title : Text, subject : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };
    let taskId = title.concat(subject).concat(Time.now().toText());
    let task : UserStudyTask = {
      taskId;
      title;
      subject;
      completed = false;
      timestamp = Time.now();
    };

    let existingTasks = switch (userTasks.get(caller)) {
      case (null) { List.empty<UserStudyTask>() };
      case (?tasks) { tasks };
    };

    existingTasks.add(task);
    userTasks.add(caller, existingTasks);
  };

  public shared ({ caller }) func markTaskCompleted(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark tasks");
    };
    let existingTasks = switch (userTasks.get(caller)) {
      case (null) { Runtime.trap("No tasks found for user") };
      case (?tasks) { tasks };
    };

    let updatedTasks = switch (existingTasks) {
      case (tasks) {
        tasks.map<UserStudyTask, UserStudyTask>(
          func(task) { if (task.taskId == taskId) { { task with completed = true } } else { task } }
        );
      };
    };

    userTasks.add(caller, updatedTasks);
  };

  public query ({ caller }) func getTasksForCaller() : async [UserStudyTask] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    let tasks = switch (userTasks.get(caller)) {
      case (null) { List.empty<UserStudyTask>() };
      case (?tasks) { tasks };
    };
    tasks.toArray().sort();
  };

  // ----------------- Quiz Attempts -----------------

  public shared ({ caller }) func saveQuizAttempt(subject : Text, chapter : Text, score : Nat, totalQuestions : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save quiz attempts");
    };
    let attemptId = subject.concat(chapter).concat(Time.now().toText());
    let attempt : QuizAttempt = {
      attemptId;
      subject;
      chapter;
      score;
      totalQuestions;
      timestamp = Time.now();
    };

    let existingAttempts = switch (quizAttempts.get(caller)) {
      case (null) { List.empty<QuizAttempt>() };
      case (?attempts) { attempts };
    };

    existingAttempts.add(attempt);
    quizAttempts.add(caller, existingAttempts);
  };

  public query ({ caller }) func getQuizAttemptsForCaller() : async [QuizAttempt] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view quiz attempts");
    };
    let attempts = switch (quizAttempts.get(caller)) {
      case (null) { List.empty<QuizAttempt>() };
      case (?attempts) { attempts };
    };
    attempts.toArray().sort();
  };

  // ----------------- Forum Logic -----------------

  public shared ({ caller }) func addForumPost(title : Text, body : Text, subject : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add posts");
    };
    let postId = title.concat(Time.now().toText());
    let post : ForumPost = {
      postId;
      title;
      body;
      subject;
      author = caller;
      timestamp = Time.now();
      replies = [];
    };

    forumPosts.add(postId, post);
    postId;
  };

  public shared ({ caller }) func addForumReply(postId : Text, body : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add replies");
    };
    let replyId = postId.concat(Time.now().toText());
    let reply : ForumReply = {
      replyId;
      postId;
      body;
      author = caller;
      timestamp = Time.now();
    };

    switch (forumPosts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let newReplies = List.empty<ForumReply>();
        for (existingReply in post.replies.values()) {
          newReplies.add(existingReply);
        };
        newReplies.add(reply);
        let updatedPost = { post with replies = newReplies.toArray().sort() : [ForumReply] };
        forumPosts.add(postId, updatedPost);
      };
    };
    replyId;
  };

  // Accessible to all including guests
  public query ({ caller }) func getAllForumPosts() : async [ForumPost] {
    forumPosts.values().toArray().sort();
  };

  // Accessible to all including guests
  public query ({ caller }) func getForumPostById(id : Text) : async ?ForumPost {
    forumPosts.get(id);
  };

  // ----------------- Profile Logic -----------------

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, { profile with name = profile.name });
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ----------------- System and Admin Functions -----------------

  // Accessible to all including guests
  public query ({ caller }) func getVersion() : async Text {
    "0.2.0";
  };

  // Accessible to all including guests
  public query ({ caller }) func getUserCount() : async Nat {
    userProfiles.size();
  };

  // ----------------- Seed Data -----------------
  system func preupgrade() {};
  system func postupgrade() {
    // Seed main subjects
    let mathSubject : Subject = {
      id = "math";
      title = "Mathematics";
      chapters = [
        {
          number = 1;
          title = "Real Numbers";
          notes = "Introduction to real numbers, properties, operations, and applications";
          mcqs = [
            {
              question = "What is the product of a rational and an irrational number?";
              options = ["Rational", "Irrational", "Natural", "Integer"];
              correctIndex = 1;
            },
            {
              question = "What is the square root of 4?";
              options = ["2", "4", "8", "16"];
              correctIndex = 0;
            },
          ];
        },
        {
          number = 2;
          title = "Polynomials";
          notes = "Types of polynomials, degree, zeroes, and operations";
          mcqs = [
            {
              question = "What is the degree of constant term?";
              options = ["0", "1", "2", "3"];
              correctIndex = 0;
            },
            {
              question = "What is the sum of roots of quadratic equation ax^2 + bx + c = 0?";
              options = ["-b/a", "b/a", "-a/b", "a/b"];
              correctIndex = 0;
            },
          ];
        },
      ];
    };

    let scienceSubject : Subject = {
      id = "science";
      title = "Science";
      chapters = [
        {
          number = 1;
          title = "Chemical Reactions and Equations";
          notes = "Types of chemical reactions, catalysts, and balancing equations";
          mcqs = [
            {
              question = "What is a chemical reaction in which two or more substances combine?";
              options = ["Decomposition", "Displacement", "Combination", "Reduction"];
              correctIndex = 2;
            },
            {
              question = "What is the symbol for catalyst in a reaction?";
              options = ["C", "K", "X", "None"];
              correctIndex = 3;
            },
          ];
        },
        {
          number = 2;
          title = "Acids, Bases, and Salts";
          notes = "Properties, reactions, and uses of acids, bases, salts";
          mcqs = [
            {
              question = "What is the pH of neutral solution?";
              options = ["0", "7", "14", "10"];
              correctIndex = 1;
            },
            {
              question = "Which acid is present in vinegar?";
              options = ["Acetic", "Citric", "Sulfuric", "Nitric"];
              correctIndex = 0;
            },
          ];
        },
      ];
    };

    let englishSubject : Subject = {
      id = "english";
      title = "English";
      chapters = [
        {
          number = 1;
          title = "Reading Skills";
          notes = "Comprehension passages, note making, and summary writing";
          mcqs = [
            {
              question = "What is a summary called in English comprehension?";
              options = ["Abstract", "Precise", "Essence", "Core"];
              correctIndex = 1;
            },
            {
              question = "What does note making help in?";
              options = ["Forgetting", "Remembering", "Sleeping", "Eating"];
              correctIndex = 1;
            },
          ];
        },
        {
          number = 2;
          title = "Writing Skills";
          notes = "Letters, applications, essays, and story writing";
          mcqs = [
            {
              question = "Letter to editor is an example of?";
              options = ["Personal", "Formal", "Idiom", "Essay"];
              correctIndex = 1;
            },
            {
              question = "Story writing needs";
              options = ["Dialogue", "Plot", "Theme", "All"];
              correctIndex = 3;
            },
          ];
        },
      ];
    };

    let hindiSubject : Subject = {
      id = "hindi";
      title = "Hindi";
      chapters = [
        {
          number = 1;
          title = "Reading Comprehension";
          notes = "Comprehension passages, poetry questions, and grammar";
          mcqs = [
            {
              question = "What is the main element in reading comprehension?";
              options = ["Analysis", "Guessing", "Knowledge", "Memory"];
              correctIndex = 0;
            },
            {
              question = "Synonyms are called?";
              options = ["Vilom", "Samanarthi", "Paryayvachi", "Both B and C"];
              correctIndex = 3;
            },
          ];
        },
        {
          number = 2;
          title = "Grammar";
          notes = "Correction of sentences, vocabulary, and essay writing";
          mcqs = [
            {
              question = "Rashtrabhasha of India is?";
              options = ["Hindi", "English", "Sanskrit", "Marathi"];
              correctIndex = 0;
            },
            {
              question = "Choose the correct grammar term for future tense";
              options = ["Bhavishya", "Vartaman", "Bhoot", "None"];
              correctIndex = 0;
            },
          ];
        },
      ];
    };

    let socialScienceSubject : Subject = {
      id = "socialscience";
      title = "Social Science";
      chapters = [
        {
          number = 1;
          title = "History";
          notes = "Nationalism, economy, agriculture, and resources";
          mcqs = [
            {
              question = "When did India get independence?";
              options = ["1948", "1947", "1950", "2000"];
              correctIndex = 1;
            },
            {
              question = "Second battle of Panipat was fought in?";
              options = ["1525", "1857", "1761", "1600"];
              correctIndex = 2;
            },
          ];
        },
        {
          number = 2;
          title = "Geography";
          notes = "Climate, minerals, forests, and water resources";
          mcqs = [
            {
              question = "Which is an evergreen forest in India?";
              options = ["Coniferous", "Deciduous", "Tropical", "None"];
              correctIndex = 2;
            },
            {
              question = "Which river originates from Amarkantak?";
              options = ["Yamuna", "Ganga", "Narmada", "Godavari"];
              correctIndex = 2;
            },
          ];
        },
      ];
    };

    let samplePaperList = [
      {
        id = "math2022";
        title = "Maths Sample Paper 2022";
        subject = "Mathematics";
        year = 2022;
        description = "CBSE Class 10 Maths Sample Paper - 2022";
      },
      {
        id = "sci2022";
        title = "Science Sample Paper 2022";
        subject = "Science";
        year = 2022;
        description = "CBSE Class 10 Science Sample Paper - 2022";
      },
      {
        id = "eng2022";
        title = "English Sample Paper 2022";
        subject = "English";
        year = 2022;
        description = "CBSE Class 10 English Sample Paper - 2022";
      },
      {
        id = "hindi2022";
        title = "Hindi Sample Paper 2022";
        subject = "Hindi";
        year = 2022;
        description = "CBSE Class 10 Hindi Sample Paper - 2022";
      },
      {
        id = "sst2022";
        title = "Social Science Sample Paper 2022";
        subject = "Social Science";
        year = 2022;
        description = "CBSE Class 10 Social Science Sample Paper - 2022";
      },
      {
        id = "math2021";
        title = "Maths Sample Paper 2021";
        subject = "Mathematics";
        year = 2021;
        description = "CBSE Class 10 Maths Sample Paper - 2021";
      },
      {
        id = "sci2021";
        title = "Science Sample Paper 2021";
        subject = "Science";
        year = 2021;
        description = "CBSE Class 10 Science Sample Paper - 2021";
      },
      {
        id = "eng2021";
        title = "English Sample Paper 2021";
        subject = "English";
        year = 2021;
        description = "CBSE Class 10 English Sample Paper - 2021";
      },
      {
        id = "hindi2021";
        title = "Hindi Sample Paper 2021";
        subject = "Hindi";
        year = 2021;
        description = "CBSE Class 10 Hindi Sample Paper - 2021";
      },
      {
        id = "sst2021";
        title = "Social Science Sample Paper 2021";
        subject = "Social Science";
        year = 2021;
        description = "CBSE Class 10 Social Science Sample Paper - 2021";
      },
    ];

    subjects.add("math", mathSubject);
    subjects.add("science", scienceSubject);
    subjects.add("english", englishSubject);
    subjects.add("hindi", hindiSubject);
    subjects.add("socialscience", socialScienceSubject);

    for (paper in samplePaperList.values()) {
      samplePapers.add(paper.id, paper);
    };
  };
};
