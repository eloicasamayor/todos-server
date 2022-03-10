const { v4: uuidv4 } = require("uuid");
const express = require("express");
const PORT = process.env.PORT || 5001;

const todos = [
  {
    id: "ad1a81f5-c327-47dd-9c6b-e6c63f47e4ff",
    text: "Afegir un nou todo",
    done: false,
  },
  { id: uuidv4(), text: "Marcat un todo com done", done: false },
  { id: uuidv4(), text: "Fer un servei de todos", done: true },
];

express()
  .use(express.text())
  .get("/", (req, res) => res.json(todos))
  .get("/:postId", (req, res) =>
    res.json(todos.filter((todo) => todo.id === req.params.postId)[0])
  )
  .post("/", (req, res) => {
    const newTodo = {
      id: uuidv4(),
      text: "No text present",
      done: false,
      ...JSON.parse(req.body),
    };
    todos.push(newTodo);
    res.json(todos);
  })
  .post("/:postId", (req, res) => {
    const index = todos.findIndex((todo) => todo.id === req.params.postId);
    if (index < 0) throw new Error("Not Found");
    todos[index] = { ...todos[index], ...JSON.parse(req.body) };
    res.json(todos);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
