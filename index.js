const { v4: uuidv4 } = require("uuid");
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5001;

const firstTodo = {
  id: "ad1a81f5-c327-47dd-9c6b-e6c63f47e4ff",
  title: "Create a new todo",
  userid: 1,
  completed: false,
};

const todos = [
  { ...firstTodo },
  {
    id: uuidv4(),
    title: "Set todo as completed",
    userid: 1,
    completed: false,
  },
  {
    id: uuidv4(),
    title: "Develop a todo list app",
    userid: 2,
    completed: true,
  },
];

function fail(req, res, message) {
  res
    .status(400)
    .header("Content-Type", "text/html; charset=utf-8")
    .send(
      `<!DOCTYPE html>
  <html>
  <head><title>Error</title></head>
  <body>
  <h1>Error</h1>
  <pre>${req.method} ${req.originalUrl}</pre>
  <p>${message}</p>
  </body>
  </html>`
    )
    .end();
}

express()
  .use(cors())
  .use(express.json())
  .use(express.text())
  .set("json spaces", 2)
  .use((err, req, res, next) => {
    console.error("x");
    console.error(err.stack);
    console.error("_");

    res.header(
      "Content-Type",
      "text/html; charset=utf-8"
    );
    console.error("a");
    res.status(500);
    console.error("b");
    res.send(`<!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body>
      <h1>Error</h1>
      <p>${err.message}</p>
      <pre>${err.stack}</pre>
      </body>
      </html>`);
    console.error("c");
    res.end();
    console.error("c");
  })

  .get("/todos", (req, res) => {
    const offset = +(req.query.offset || 0);
    const limit = +(req.query.limit || todos.length);

    let result = todos;
    if (isTrue(req.query.completed))
      result = result.filter((todo) => todo.completed);
    if (isFalse(req.query.completed))
      result = result.filter(
        (todo) => !todo.completed
      );
    if (req.query.title)
      result = result.filter((todo) =>
        todo.title
          .toLowerCase()
          .includes(
            req.query.title.toLowerCase().trim()
          )
      );
    if (req.query.userid)
      result = result.forEach(
        (todo) => (todo.userid = parseInt(todo.userid))
      );

    res.json(result.slice(offset, offset + limit));
  })

  .get("/todos/:id", (req, res, next) => {
    const { id } = req.params;
    const [todo] = todos.filter((t) => t.id === id);

    if (!todo)
      return fail(req, res, `Todo "${id}" not found`);
    res.json(todo);
  })

  .post("/todos", (req, res, next) => {
    const receivedTodo = parseBody(req.body);
    if (receivedTodo.id)
      return fail(
        req,
        res,
        "Todo should not have an id"
      );

    const newTodo = cleanupTodo({
      id: uuidv4(),
      title: "No title present",
      userid: 0,
      completed: false,
      ...receivedTodo,
    });
    todos.push(newTodo);
    res.json(newTodo);
  })
  .post("/todos/:id", (req, res, next) => {
    const { id } = req.params;
    const index = todos.findIndex((t) => t.id === id);
    if (index < 0)
      return fail(
        req,
        res,
        `Not Found todo with id "${id}"`
      );

    const receivedTodo = parseBody(req.body);
    if (receivedTodo.id && receivedTodo.id !== id)
      return fail(
        req,
        res,
        `Id mismatch: asked in the GET to update the todo with id "${id}" but the id in the body is "${receivedTodo.id}"`
      );

    const newTodo = cleanupTodo({
      ...todos[index],
      ...receivedTodo,
    });
    todos[index] = newTodo;
    res.json(todos[index]);
  })

  .delete("/todos", (req, res, next) => {
    todos.length = 0;
    todos.push({ ...firstTodo });
    res.json(todos);
  })

  .delete("/todos/:id", (req, res, next) => {
    const { id } = req.params;
    if (id === firstTodo.id)
      return fail(
        req,
        res,
        `Cannot delete the first todo`
      );

    const index = todos.findIndex((t) => t.id === id);
    if (index < 0)
      return fail(
        req,
        res,
        `Not Found todo with id "${id}"`
      );
    const [deletedTodo] = todos.splice(index, 1);
    res.json(deletedTodo);
  })

  .listen(PORT, () =>
    console.log(`Listening on ${PORT}`)
  );

function parseBody(body) {
  if (typeof body === "string")
    return JSON.parse(body);
  return body;
}

function isTrue(value) {
  if (!value) return;
  value = value.toLowerCase();
  return (
    value === "true" ||
    value === "1" ||
    value === "yes"
  );
}

function isFalse(value) {
  if (!value) return;
  value = value.toLowerCase();
  return (
    value === "false" ||
    value === "0" ||
    value === "no"
  );
}

function cleanupTodo(todo) {
  const { id, title, userid, completed } = todo;
  return {
    id: `${id}`,
    title: `${title}`,
    userid: userid,
    completed: !!completed,
  };
}
