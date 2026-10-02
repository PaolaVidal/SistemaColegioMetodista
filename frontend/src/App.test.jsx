import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

import './index.css';

describe('App', () => {
  it('renders the home page through the application routes', () => {
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Sistema Colegio Metodista' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido al esqueleto/i)).toBeInTheDocument();
  });
});
