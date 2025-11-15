import { createFileRoute } from '@tanstack/react-router';

type Todo = {
  id: number;
  name: string;
};

const todos: Todo[] = [
  {
    id: 1,
    name: 'Buy groceries',
  },
  {
    id: 2,
    name: 'Buy mobile phone',
  },
  {
    id: 3,
    name: 'Buy laptop',
  },
];

export const Route = createFileRoute('/demo/api/tq-todos')({
  server: {
    handlers: {
      GET: () => {
        return Response.json(todos);
      },
      POST: async ({ request }) => {
        const payload = (await request.json().catch(() => null)) as {
          name?: unknown;
        } | null;
        const rawName = payload?.name;
        const name =
          typeof rawName === 'string' && rawName.trim().length > 0
            ? rawName
            : null;

        if (!name) {
          return Response.json(
            { message: 'Please provide a todo name in the request body.' },
            { status: 400 },
          );
        }

        const todo = {
          id: todos.length + 1,
          name,
        };
        todos.push(todo);
        return Response.json(todo);
      },
    },
  },
});
