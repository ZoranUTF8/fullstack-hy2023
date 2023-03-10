const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const User = require("../models/user");
const api = supertest(app);
const helper = require("./test_helper");
const logger = require("../utils/logger");

/*
The database is cleared out at the beginning,
and after that, we save the two notes stored 
in the initialNotes array to the database. By
doing this, we ensure that the database is in
the same state before every test is run.
*/
let authToken = "";
beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogPost);

  await User.deleteMany({});
  await User.insertMany(helper.initialUsersInDb);

  const response = await api
    .post("/api/auth/login")
    .send({ username: "Zochan", password: "Moeko2023!" });

  authToken = response.body.token;
}, 10000);

//? Tests

//* Blog

describe("when there are blog posts added", () => {
  test("a specific blog post is within the returned notes", async () => {
    const response = await api.get("/api/blogs");
    const titles = response.body.map((r) => r.title);
    expect(titles).toContain("First class tests");
  });

  test("blog posts are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  }, 100000);
  test("a specific blog post can be viewed", async () => {
    const blogStartState = await helper.blogPostsInDb();

    const blogToView = blogStartState[0];

    const blogPost = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(blogPost.body.data.id).toEqual(blogToView.id);
  });

  test("identifier property of the blog posts is named id", async () => {
    const blogPostFromDb = await helper.blogPostsInDb();

    const blogPostToView = blogPostFromDb[0];

    expect(blogPostToView.id).toBeDefined();
  });

  test("if likes property is missing from the request, it will default to the value 0", async () => {
    const newBlogPost = {
      title: "New blog post",
      author: "Some author",
      url: "http://example.com",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newBlogPost)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const allBlogs = await helper.blogPostsInDb();

    const lastAddedPost = allBlogs.pop();

    expect(lastAddedPost.likes).toBe("0");
  });
  test("verify that if the title or url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request", async () => {
    const newBlogPost = {
      author: "Some author",
    };
    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newBlogPost)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  }, 10000);
});

describe("addition of a new blog post", () => {
  test("a valid blog post can be added", async () => {
    const newBlogPost = {
      title: "New blog post",
      author: "Some author",
      url: "http://example.com",
      likes: 20,
      user: "63f8391ff6a57f6caf13430a",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(newBlogPost)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const allBlogs = await helper.blogPostsInDb();

    expect(allBlogs).toHaveLength(helper.initialBlogPost.length + 1);

    const blogContents = allBlogs.map((n) => n.title);

    expect(blogContents).toContain("New blog post");
  }, 10000);

  test("Blog post without content is not added", async () => {
    const newBlogPost = {
      title: "test title",
    };

    await api
      .post("/api/blogs")
      .send(newBlogPost)
      .set("Authorization", `Bearer ${authToken}`)
      .expect(400);

    const allBlogs = await helper.blogPostsInDb();

    expect(allBlogs).toHaveLength(helper.initialBlogPost.length);
  });

  test("Blog post without token cannot be created", async () => {
    const newBlogPost = {
      title: "New blog post 2",
      author: "Some author",
      url: "http://example.com",
      likes: 20,
      user: "63f8391ff6a57f6caf13430a",
    };

    await api
      .post("/api/blogs")
      .send(newBlogPost)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const allBlogs = await helper.blogPostsInDb();

    expect(allBlogs).toHaveLength(helper.initialBlogPost.length);

    const blogContents = allBlogs.map((n) => n.title);

    expect(blogContents).not.toContain("New blog post 2");
  });
});

describe("deletion of a blog post", () => {
  test("a blog post can be deleted", async () => {
    const users = await helper.allRegisteredUsers();

    const blogPostsStartState = await helper.blogPostsInDb();
    const blogPostToDelete = blogPostsStartState[0];

    await api
      .delete(`/api/blogs/${blogPostToDelete.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .set("User", users[0])
      .expect(200);

    const blogPostsAfterDelete = await helper.blogPostsInDb();

    expect(blogPostsAfterDelete).toHaveLength(
      helper.initialBlogPost.length - 1
    );

    const contents = blogPostsAfterDelete.map((r) => r.title);

    expect(contents).not.toContain(blogPostToDelete.title);
  }, 10000);
});

describe("update a blog post", () => {
  test("a valid blog post can be updated", async () => {
    const blogPostsStartState = await helper.blogPostsInDb();

    let blogPostToUpdate = blogPostsStartState[0];

    blogPostToUpdate = { ...blogPostToUpdate, likes: "20" };

    const response = await api
      .put(`/api/blogs/${blogPostToUpdate.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(blogPostToUpdate);

    expect(response.status).toBe(200);

    expect(response.body.data.likes).toBe("20");
  }, 10000);
});

//* Users
//! FIX LATER Not working     ValidationError: User validation failed: username: Path `username` is required.  ???
describe("ensure invalid users are not created ", () => {
  test("a invalid user cannot be added", async () => {
    const invalidUser = {
      name: "test title",
    };
    await api.post("/api/users").send(invalidUser).expect(400);

    const allUsersInDb = await helper.allRegisteredUsers();

    logger.info("ALL USERS IN DB ", allUsersInDb);

    expect(allUsersInDb).toHaveLength(helper.initialUsersInDb.length);
  });

  test("a valid user can be added", async () => {
    // const allBlogs = await helper.blogPostsInDb();
    // expect(allBlogs).toHaveLength(helper.initialBlogPost.length + 1);
    // const blogContents = allBlogs.map((n) => n.title);
    // expect(blogContents).toContain("New blog post");
  }, 10000);
});

afterAll(async () => {
  await mongoose.connection.close();
});
