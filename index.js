const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

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

app.get("/info", (req, res) => {
  Person.countDocuments({}).then((result) => {
    res.send(
      `<p>Phonebook has info for ${result} people</p><p>${
        Date(Date.now())
      }</p>`,
    );
  });
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id).then((result) => {
    if (result) {
      res.json(result);
    } else {
      res.status(404).end();
    }
  }).catch((e) => {
    next(e);
  });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then((result) => {
    res.status(204).end();
  }).catch((e) => next(e));
});

app.post("/api/persons", (req, res, next) => {
  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  }).catch((e) => next(e));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const updatedPerson = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(req.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  }).then(
    (result) => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).end();
      }
    },
  ).catch((e) => {
    next(e);
  });
});

const errorHandler = (e, req, res, next) => {
  console.error(e.message);

  if (e.name === "CastError") {
    res.status(400).send({ error: "malformatted id" });
  } else if (e.name === "ValidationError") {
    res.status(400).send({ error: e.message });
  }

  next(e);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
