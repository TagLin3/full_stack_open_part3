const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
morgan.token("reqbody", (req, res) => {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :reqbody",
  ),
);

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456",
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345",
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
  },
];

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${
      Date(Date.now())
    }</p>`,
  );
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const person = persons.find((p) => p.id === Number(req.params.id));
  if (!person) {
    return res.status(404).end();
  }
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  persons = persons.filter((p) => p.id !== Number(req.params.id));
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  if (!req.body.name || !req.body.number) {
    return res.status(400).send({
      "error": "name or number missing",
    });
  }
  if (persons.some((p) => p.name === req.body.name)) {
    return res.status(400).send({
      "error": "name must be unique",
    });
  }
  const person = {
    name: req.body.name,
    number: req.body.number,
    id: Math.floor(Math.random() * 10000),
  };
  persons = persons.concat(person);
  res.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
