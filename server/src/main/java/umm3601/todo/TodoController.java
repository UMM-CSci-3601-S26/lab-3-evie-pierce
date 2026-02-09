package umm3601.todo;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

//import java.nio.charset.StandardCharsets;
//import java.security.MessageDigest;
//import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
//import java.util.Map;
import java.util.Objects;
//import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
//import com.mongodb.client.result.DeleteResult;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import umm3601.Controller;

/**
 * Controller that manages requests for info about todos.
 */
public class TodoController implements Controller {

  private static final String API_TODOS = "/api/todos";
  private static final String API_TODO_BY_ID = "/api/todos/{id}";
  static final String OWNER_KEY = "owner";
  static final String STATUS_KEY = "status";
  static final String BODY_KEY = "contains"; //"body?"
  static final String CATEGORY_KEY = "category";
  static final String LIMIT_KEY = "limit";
  static final String ORDER_KEY = "orderBy";
  static final String STATUS_REGEX = "^(complete|incomplete)$";
  // static final String AGE_KEY = "age";
  // static final String COMPANY_KEY = "company";
  // static final String ROLE_KEY = "role";
  // static final String SORT_ORDER_KEY = "sortorder";
  // private static final int REASONABLE_AGE_LIMIT = 150;
  // private static final String ROLE_REGEX = "^(admin|editor|viewer)$";
  // public static final String EMAIL_REGEX = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$";

  private final JacksonMongoCollection<Todo> todoCollection;

  /**
   * Construct a controller for users.
   *
   * @param database the database containing user data
   */
  public TodoController(MongoDatabase database) {
    todoCollection = JacksonMongoCollection.builder().build(
        database,
        "todos",
        Todo.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Set the JSON body of the response to be the single user
   * specified by the `id` parameter in the request
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodo(Context ctx) {
    String id = ctx.pathParam("id");
    Todo todo;

    try {
      todo = todoCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested todo id wasn't a legal Mongo Object ID.");
    }
    if (todo == null) {
      throw new NotFoundResponse("The requested todo was not found");
    } else {
      ctx.json(todo);
      ctx.status(HttpStatus.OK);
    }
  }

  /**
   * Set the JSON body of the response to be a list of all the users returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodos(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);
    String tempLimit = ctx.queryParam(LIMIT_KEY); //Need a temporary step; param can be null but integers cannot.
    //Should really just not run the limiter if missing, but couldn't figure out how.
    Integer targetLimit = Integer.MAX_VALUE;
    if (tempLimit != null) {
      targetLimit = Integer.parseInt(tempLimit);
    }
    // All three of the find, sort, and into steps happen "in parallel" inside the
    // database system. So MongoDB is going to find the users with the specified
    // properties, return those sorted in the specified manner, and put the
    // results into an initially empty ArrayList.
    ArrayList<Todo> matchingTodos = todoCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .limit(targetLimit)
      .into(new ArrayList<>());

    // Set the JSON body of the response to be the list of todos returned by the database.
    // According to the Javalin documentation (https://javalin.io/documentation#context),
    // this calls result(jsonString), and also sets content type to json
    ctx.json(matchingTodos);

    // Explicitly set the context status to OK
    ctx.status(HttpStatus.OK);
  }

  /**
   * Construct a Bson filter document to use in the `find` method based on the
   * query parameters from the context.
   *
   * This checks for the presence of the `age`, `company`, and `role` query
   * parameters and constructs a filter document that will match users with
   * the specified values for those fields.
   *
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *    used to construct the filter
   * @return a Bson filter document that can be used in the `find` method
   *   to filter the database collection of users
   */
  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with an empty list of filters
    if (ctx.queryParamMap().containsKey(CATEGORY_KEY)) {
      String category = ctx.queryParam(CATEGORY_KEY);
      filters.add(eq(CATEGORY_KEY, category));
    }

    if (ctx.queryParamMap().containsKey(BODY_KEY)) {
      String substring = ctx.queryParam(BODY_KEY);
      filters.add(regex("body", substring)); //the body parameter is now different from the Key.
    }

    if (ctx.queryParamMap().containsKey(OWNER_KEY)) {
      String owner = ctx.queryParam(OWNER_KEY);
      filters.add(regex(OWNER_KEY, owner));
    }
    if (ctx.queryParamMap().containsKey(STATUS_KEY)) {
      String status = ctx.queryParamAsClass(STATUS_KEY, String.class)
        .check(it -> it.matches(STATUS_REGEX), "Status must be complete or incomplete.")
         .get();
      Boolean realStatus = false;
      if (new String("complete").equals(status)) {
        realStatus = true;
      }
      filters.add(eq(STATUS_KEY, realStatus));
    }

    // Combine the list of filters into a single filtering document.
    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  /**
   * Construct a Bson sorting document to use in the `sort` method based on the
   * query parameters from the context.
   *
   * This checks for the presence of the `sortby` and `sortorder` query
   * parameters and constructs a sorting document that will sort users by
   * the specified field in the specified order. If the `sortby` query
   * parameter is not present, it defaults to "name". If the `sortorder`
   * query parameter is not present, it defaults to "asc".
   *
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *   used to construct the sorting order
   * @return a Bson sorting document that can be used in the `sort` method
   *  to sort the database collection of users
   */
  private Bson constructSortingOrder(Context ctx) {
    // Sort the results. Use the `sortby` query param (default "name")
    // as the field to sort by, and the query param `sortorder` (default
    // "asc") to specify the sort order.
    String sortType = ("unsorted"); //Default to a nonexistent key; returns unsorted results.
    if (ctx.queryParamMap().containsKey(ORDER_KEY)) {
      sortType = ctx.queryParamAsClass(ORDER_KEY, String.class)
      .get();
    }
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), sortType);
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }
  /**
   * Sets up routes for the `user` collection endpoints.
   * A UserController instance handles the user endpoints,
   * and the addRoutes method adds the routes to this controller.
   *
   * These endpoints are:
   *   - `GET /api/users/:id`
   *       - Get the specified user
   *   - `GET /api/users?age=NUMBER&company=STRING&name=STRING`
   *      - List users, filtered using query parameters
   *      - `age`, `company`, and `name` are optional query parameters
   *   - `GET /api/usersByCompany`
   *     - Get user names and IDs, possibly filtered, grouped by company
   *   - `DELETE /api/users/:id`
   *      - Delete the specified user
   *   - `POST /api/users`
   *      - Create a new user
   *      - The user info is in the JSON body of the HTTP request
   *
   * GROUPS SHOULD CREATE THEIR OWN CONTROLLERS THAT IMPLEMENT THE
   * `Controller` INTERFACE FOR WHATEVER DATA THEY'RE WORKING WITH.
   * You'll then implement the `addRoutes` method for that controller,
   * which will set up the routes for that data. The `Server#setupRoutes`
   * method will then call `addRoutes` for each controller, which will
   * add the routes for that controller's data.
   *
   * @param server The Javalin server instance
   */
  @Override
  public void addRoutes(Javalin server) {
    // Get the specified todo
    server.get(API_TODO_BY_ID, this::getTodo); //  "/api/todos/{id}"

    // List todos, filtered using query parameters
    server.get(API_TODOS, this::getTodos); //  "/api/todos"

    // Get the todos, possibly filtered
    //server.get("/api/todosByCompany", this::getUsersGroupedByCompany);

    // Add new todo with the todo info being in the JSON body
    // of the HTTP request
    //server.post(API_TODOS, this::addNewUser);

    // Delete the specified todo
    //server.delete(API_TODO_BY_ID, this::deleteUser);
  }
}
