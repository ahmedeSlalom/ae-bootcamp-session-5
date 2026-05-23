import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  Checkbox,
  IconButton,
  Paper,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './App.css';

// Use relative URL for API calls (works in both dev and production)
const API_URL = 'http://localhost:3001/api/todos';

// React Query hook for fetching todos
const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      return data;
    },
  });
};

function App() {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const queryClient = useQueryClient();

  // Fetch todos using React Query
  const { data: todos = [], isLoading, error } = useTodos();

  // Mutation for adding a new todo
  const addTodoMutation = useMutation({
    mutationFn: async (title) => {
      // INTENTIONAL ISSUE: Missing validation for empty title
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodoTitle('');
    },
  });

  // Mutation for toggling todo completion
  const toggleTodoMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Delete mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      addTodoMutation.mutate(newTodoTitle);
    }
  };

  const handleToggleTodo = (id) => {
    toggleTodoMutation.mutate(id);
  };

  const handleDeleteTodo = (id) => {
    deleteTodoMutation.mutate(id);
  };

  // INTENTIONAL ISSUE: Edit functionality not implemented
  // const handleEditTodo = (id, newTitle) => { ... }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            TODO App
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Session 5: Agentic Development
          </Typography>
        </Paper>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              component="form"
              onSubmit={handleAddTodo}
              sx={{ display: 'flex', gap: 2 }}
            >
              <TextField
                fullWidth
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="What needs to be done?"
                variant="outlined"
                size="medium"
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ minWidth: 120 }}
              >
                Add
              </Button>
            </Box>
          </CardContent>
        </Card>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography color="error" variant="h6">
              Error loading todos
            </Typography>
            <Typography color="text.secondary">
              {error.message || 'Please try again later'}
            </Typography>
          </Box>
        )}

        {!isLoading && !error && todos.length === 0 && (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No todos yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add a todo to get started!
            </Typography>
          </Box>
        )}

        {!isLoading && !error && todos.length > 0 && (
        <Card>
          <List sx={{ p: 0 }}>
            {todos.map((todo, index) => (
              <ListItem
                key={todo.id}
                sx={{
                  borderBottom: index < todos.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Checkbox
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  sx={{ mr: 2 }}
                />
                <Typography
                  sx={{
                    flex: 1,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {todo.title}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    aria-label="edit"
                    onClick={() => console.log('Edit not implemented')}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="delete"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItem>
            ))}
          </List>
        </Card>
        )}

        {/* Stats calculation */}
        {!isLoading && !error && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Chip 
            label={`${todos.filter(todo => !todo.completed).length} items left`} 
            color="primary" 
          />
          <Chip 
            label={`${todos.filter(todo => todo.completed).length} completed`} 
            color="success" 
          />
        </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
