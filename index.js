const { v4: uuidv4 } = require("uuid");
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5001;

const todos = [
  {
    id: "ad1a81f5-c327-47dd-9c6b-e6c63f47e4ff",
    title: "Afegir un nou todo",
    details:
      "Al començar ja en tenim, pero en volem més.",
    completed: false,
  },
  {
    id: uuidv4(),
    title: "Marcat un todo com completed",
    details: "Marca aquest todo com completat.",
    completed: false,
  },
  {
    id: uuidv4(),
    title: "Fer un servei de todos",
    details: "",
    completed: true,
  },
];

express()
  .use(cors())
  .use(express.text())
  .get("/todos/", (req, res) => {
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
            req.query.title.toLocaleLowerCase().trim()
          )
      );
    if (req.query.details)
      result = result.filter((todo) =>
        todo.details
          .toLowerCase()
          .includes(
            req.query.details
              .toLocaleLowerCase()
              .trim()
          )
      );

    res.json(result.slice(offset, offset + limit));
  })
  .get("/todos/:postId", (req, res) => {
    res.json(
      todos.filter(
        (todo) => todo.id === req.params.postId
      )[0]
    );
  })
  .post("/todos/", (req, res) => {
    const { title, details, completed } = JSON.parse(
      req.body
    );
    const receivedTodo = { title, details, completed };

    const newTodo = {
      id: uuidv4(),
      title: "No title present",
      details: "",
      completed: false,
      ...receivedTodo,
    };
    todos.push(newTodo);
    res.json(newTodo);
  })
  .post("/todos/:postId", (req, res) => {
    const index = todos.findIndex(
      (todo) => todo.id === req.params.postId
    );
    if (index < 0) throw new Error("Not Found");

    const { title, details, completed } = JSON.parse(
      req.body
    );
    const receivedTodo = { title, details, completed };

    todos[index] = {
      ...todos[index],
      ...receivedTodo,
    };
    res.json(todos[index]);
  })
  .delete("/todos/:postId", (req, res) => {
    const index = todos.findIndex(
      (todo) => todo.id === req.params.postId
    );
    if (index < 0) throw new Error("Not Found");
    const deletedTodo = todos.splice(index, 1);
    res.json(deletedTodo);
  })
  .listen(PORT, () =>
    console.log(`Listening on ${PORT}`)
  );

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
