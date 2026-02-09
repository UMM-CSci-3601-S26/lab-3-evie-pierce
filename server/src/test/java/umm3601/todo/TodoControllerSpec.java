package umm3601.todo;

//import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.junit.jupiter.api.Assertions.assertNotEquals;
//import static org.junit.jupiter.api.Assertions.assertNotNull;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
//import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
//import java.util.stream.Collectors;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
//import org.mockito.ArgumentMatcher;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.JsonMappingException;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
//import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
//import io.javalin.http.NotFoundResponse;
//import io.javalin.json.JavalinJackson;
//import io.javalin.validation.BodyValidator;
//import io.javalin.validation.ValidationError;
//import io.javalin.validation.ValidationException;
//import io.javalin.validation.Validator;
//import umm3601.todo.TodoController;
//import umm3601.user.UserController;
import io.javalin.validation.Validation;
import io.javalin.validation.Validator;
//import umm3601.user.UserController;

/**
 * Tests the logic of the UserController
 *
 * @throws IOException
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({ "MagicNumber" })
class TodoControllerSpec {

  // An instance of the controller we're testing that is prepared in
  // `setupEach()`, and then exercised in the various tests below.
  private TodoController todoController;

  // A Mongo object ID that is initialized in `setupEach()` and used
  // in a few of the tests. It isn't used all that often, though,
  // which suggests that maybe we should extract the tests that
  // care about it into their own spec file?
  private ObjectId testID;

  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;

  // Used to translate between JSON and POJOs.
  //private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;

  @Captor
  private ArgumentCaptor<Todo> todoCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  /**
   * Sets up (the connection to the) DB once; that connection and DB will
   * then be (re)used for all the tests, and closed in the `teardown()`
   * method. It's somewhat expensive to establish a connection to the
   * database, and there are usually limits to how many connections
   * a database will support at once. Limiting ourselves to a single
   * connection that will be shared across all the tests in this spec
   * file helps both speed things up and reduce the load on the DB
   * engine.
   */
  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    // Reset our mock context and argument captor (declared with Mockito
    // annotations @Mock and @Captor)
    MockitoAnnotations.openMocks(this);

    // Setup database
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();

    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
        new Document()
          .append("owner", "Alfred")
          .append("status", false)
          .append("body", "Do the first thing")
          .append("category", "homework")
          );
    testTodos.add(
        new Document()
         .append("owner", "Bob")
          .append("status", false)
          .append("body", "Do the second thing")
          .append("category", "homework")
          );
    testTodos.add(
        new Document()
         .append("owner", "Clide")
          .append("status", true)
          .append("body", "Do the third thing")
          .append("category", "games")
          );

    testID = new ObjectId();
    Document fourth = new Document()
        .append("_id", testID)//This will be used later for testing purposes.
        .append("owner", "Dave")
        .append("status", true)
        .append("body", "Do the fourth thing")
        .append("category", "alphabetizing");

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(fourth);

    todoController = new TodoController(db);
  }

  @Test
  void addsRoutes() {
    Javalin mockServer = mock(Javalin.class);
    todoController.addRoutes(mockServer);
    verify(mockServer, Mockito.atLeast(1)).get(any(), any()); //Number of Invocations? Update this?
    //verify(mockServer, Mockito.atLeastOnce()).post(any(), any());
   // verify(mockServer, Mockito.atLeastOnce()).delete(any(), any());
  }

  @Test
  void canGetAllTodos() throws IOException {
    // When something asks the (mocked) context for the queryParamMap,
    // it will return an empty map (since there are no query params in
    // this case where we want all users).
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());

    // Now, go ahead and ask the todoController to getTodos
    // (which will, indeed, ask the context for its queryParamMap)
    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);

    // Check that the database collection holds the same number of documents
    // as the size of the captured List<Todos>
    assertEquals(
        db.getCollection("todos").countDocuments(),
        todoArrayListCaptor.getValue().size());
  }

  @Test
  void getTodoWithExistentId() throws IOException {
    String id = testID.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    todoController.getTodo(ctx);

    //The todoCaptor only captures a single Todo.
    verify(ctx).json(todoCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("Dave", todoCaptor.getValue().owner);
    assertEquals(id, todoCaptor.getValue()._id);
  }

  @Test
  void getTodoWithBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("bad");

    Throwable exception = assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    });

    assertEquals("The requested todo id wasn't a legal Mongo Object ID.", exception.getMessage());
  }

  @Test
  void listTodosByCategory() throws IOException {
     Map<String, List<String>> queryParams = new HashMap<>();
      queryParams.put(TodoController.CATEGORY_KEY, Arrays.asList(new String[] {"homework"}));
      //Whenever the TodoController would use queryParamMap; provide the tests's queryParams instead.
      when(ctx.queryParamMap()).thenReturn(queryParams);
      //Whenever the TodoController would use queryParam; provide the string "homework" instead.
      when(ctx.queryParam(TodoController.CATEGORY_KEY)).thenReturn("homework");

      //Validator is only necessary if we're using 'queryParamAsClass.' In this case, we're just expecting a raw string.
      // Validation validation = new Validation();
      // Validator<String> validator = validation.validator(TodoController.CATEGORY_KEY, String.class, "homework");
      // when(ctx.queryParamAsClass(TodoController.CATEGORY_KEY, String.class)).thenReturn(validator);

      todoController.getTodos(ctx);
    //Make sure we're capturing the results as an array.
      verify(ctx).json(todoArrayListCaptor.capture());
      verify(ctx).status(HttpStatus.OK);

      // Confirm that all the todos passed to `json` have the requested category.
      for (Todo todo : todoArrayListCaptor.getValue()) {
        assertEquals("homework", todo.category);
      }
  }

  @Test
  void testLimitTodos() throws IOException {
      //Integer targetLimit = 67;
      String targetLimitString = "3"; //targetLimit.toString();

     Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(TodoController.LIMIT_KEY, Arrays.asList(new String[] {targetLimitString}));
      //Whenever the TodoController would use queryParamMap; provide the desired limit instead.
      when(ctx.queryParamMap()).thenReturn(queryParams);
      //Whenever the TodoController would use queryParam; provide the desired limit instead.
      when(ctx.queryParam(TodoController.LIMIT_KEY)).thenReturn(targetLimitString);

      todoController.getTodos(ctx);
      //Make sure we're capturing the results as an array.
      verify(ctx).json(todoArrayListCaptor.capture());
      verify(ctx).status(HttpStatus.OK);

      // Confirm we get back 3 of the 4 todos.
      assertEquals(3, todoArrayListCaptor.getValue().size());
  }

  @Test
  void testCompleteTodos() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
      queryParams.put(TodoController.STATUS_KEY, Arrays.asList(new String[] {"complete"}));
      //Whenever the TodoController would use queryParamMap; provide the tests's queryParams instead.
      when(ctx.queryParamMap()).thenReturn(queryParams);
      //Whenever the TodoController would use queryParam; provide the string "complete" instead.
      when(ctx.queryParam(TodoController.STATUS_KEY)).thenReturn("complete");

      //Validator is only necessary if we're using 'queryParamAsClass.' In this case, we're just expecting a raw string.
      Validation validation = new Validation();
      Validator<String> validator = validation.validator(TodoController.STATUS_KEY, String.class, "complete");
      when(ctx.queryParamAsClass(TodoController.STATUS_KEY, String.class)).thenReturn(validator);

      todoController.getTodos(ctx);
    //Make sure we're capturing the results as an array.
      verify(ctx).json(todoArrayListCaptor.capture());
      verify(ctx).status(HttpStatus.OK);

      // Confirm that all the todos passed to `json` are in fact complete
      for (Todo todo : todoArrayListCaptor.getValue()) {
        assertEquals("true", todo.status); //Weird the database doesn't consider this a boolean.
      }
  }

  @Test
  void testIncompleteTodos() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
      queryParams.put(TodoController.STATUS_KEY, Arrays.asList(new String[] {"incomplete"}));
      //Whenever the TodoController would use queryParamMap; provide the tests's queryParams instead.
      when(ctx.queryParamMap()).thenReturn(queryParams);
      //Whenever the TodoController would use queryParam; provide the string "incomplete" instead.
      when(ctx.queryParam(TodoController.STATUS_KEY)).thenReturn("incomplete");

      //Validator is only necessary if we're using 'queryParamAsClass.' In this case, we're just expecting a raw string.
      Validation validation = new Validation();
      Validator<String> validator = validation.validator(TodoController.STATUS_KEY, String.class, "incomplete");
      when(ctx.queryParamAsClass(TodoController.STATUS_KEY, String.class)).thenReturn(validator);

      todoController.getTodos(ctx);
    //Make sure we're capturing the results as an array.
      verify(ctx).json(todoArrayListCaptor.capture());
      verify(ctx).status(HttpStatus.OK);

      // Confirm that all the todos passed to `json` are in fact complete
      for (Todo todo : todoArrayListCaptor.getValue()) {
        assertEquals("false", todo.status);
      }
  }

  @Test
  void listTodosByBody() throws IOException {
     Map<String, List<String>> queryParams = new HashMap<>();
      queryParams.put(TodoController.BODY_KEY, Arrays.asList(new String[] {"thing"}));
      //Whenever the TodoController would use queryParamMap; provide the tests's queryParams instead.
      when(ctx.queryParamMap()).thenReturn(queryParams);
      //Whenever the TodoController would use queryParam; provide the string "homework" instead.
      when(ctx.queryParam(TodoController.BODY_KEY)).thenReturn("thing");

      todoController.getTodos(ctx);
    //Make sure we're capturing the results as an array.
      verify(ctx).json(todoArrayListCaptor.capture());
      verify(ctx).status(HttpStatus.OK);

      // All four provided todos have 'things' in their body.
     assertEquals(4, todoArrayListCaptor.getValue().size());
  }

  @Test
  void orderTodosByCategory() throws IOException {
     Map<String, List<String>> queryParams = new HashMap<>();
      queryParams.put(TodoController.ORDER_KEY, Arrays.asList(new String[] {TodoController.CATEGORY_KEY}));
      //Whenever the TodoController would use queryParamMap; provide the tests's queryParams instead.
      when(ctx.queryParamMap()).thenReturn(queryParams);
      //Whenever the TodoController would use queryParam; provide the string desired order method instead.
      when(ctx.queryParam(TodoController.ORDER_KEY)).thenReturn(TodoController.CATEGORY_KEY);

    Validation validation = new Validation();
    Validator<String> validator =
        validation.validator(TodoController.ORDER_KEY, String.class, TodoController.CATEGORY_KEY);
    when(ctx.queryParamAsClass(TodoController.ORDER_KEY, String.class)).thenReturn(validator);

      todoController.getTodos(ctx);
    //Make sure we're capturing the results as an array.
      verify(ctx).json(todoArrayListCaptor.capture());
      verify(ctx).status(HttpStatus.OK);

    // The category 'alphabetizing' is alphabetically first. Therefore the first element
     assertEquals("alphabetizing", todoArrayListCaptor.getValue().getFirst().category);
  }

  @Test
  void categoryCombination() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
      queryParams.put(TodoController.CATEGORY_KEY, Arrays.asList(new String[] {"homework"}));
      queryParams.put(TodoController.OWNER_KEY, Arrays.asList(new String[] {"Alfred"}));
      queryParams.put(TodoController.STATUS_KEY, Arrays.asList(new String[] {"incomplete"}));
      //Whenever the TodoController would use queryParamMap; provide the tests's queryParams instead.
      when(ctx.queryParamMap()).thenReturn(queryParams);
      //Whenever the TodoController would use just queryParam; provide the string desired order method instead.
      when(ctx.queryParam(TodoController.CATEGORY_KEY)).thenReturn("homework");
      when(ctx.queryParam(TodoController.OWNER_KEY)).thenReturn("Alfred");
      when(ctx.queryParam(TodoController.STATUS_KEY)).thenReturn("incomplete");

    //Status uses queryParamAsClass, and therefore needs a validator.
    Validation validation = new Validation();
    Validator<String> validator = validation.validator(TodoController.STATUS_KEY, String.class, "incomplete");
    when(ctx.queryParamAsClass(TodoController.STATUS_KEY, String.class)).thenReturn(validator);


      todoController.getTodos(ctx);
    //Make sure we're capturing the results as an array.
      verify(ctx).json(todoArrayListCaptor.capture());
      verify(ctx).status(HttpStatus.OK);

    // Only Alfred's Todo should fit all three filters.
     assertEquals("Do the first thing", todoArrayListCaptor.getValue().getFirst().body);
  }
}
