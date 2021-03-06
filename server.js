var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');

// GraphQL schema
var schema = buildSchema(`
    type Query {
        todo(id: Int!): Todo
        todos(title: String): [Todo]
    },

    type Mutation {
        addTodo(title: String): [Todo]
        updateTodo(id: Int!, title: String, done: Boolean): [Todo]
        removeTodo(id: Int!): [Todo]
    }

    type Todo {
        id: Int
        title: String
        done: Boolean
    }
`);

var todosMock = [
    {
        id: 1,
        title: 'Supermarket',
        done: false
    },
    {
        id: 2,
        title: 'Read a new book',
        done: false
    },
    {
        id: 3,
        title: 'Write a Medium post',
        done: true
    }
]

var root = {
    todo: (args) => todosMock.find(_ => _.id == args.id),
    todos: (args) => args.title ? todosMock.filter(_ => _.title.indexOf(args.title) > 1) : todosMock,
    addTodo: ({ title }) => {
        var id = [...todosMock].pop().id + 1
        todosMock.push({ id: id, title: title, done: false })
        return todosMock
    },
    updateTodo: ({ id, title, done }) => {
        todosMock.map(todo => {
            if (todo.id === id) {
                todo.title = title != null && title != todo.title ? title : todo.title;
                todo.done = done != null && done != todo.done ? done : todo.done;
            }
        });

        return todosMock
    },
    removeTodo: ({ id }) => {
        todosMock = [...todosMock.filter(_ => _.id !== id)]
        return todosMock
    }
};

var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));