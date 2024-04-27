import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './src/App.jsx';

describe('App', () => {
  it('renders App', () => {
    render(<App/>)
    screen.debug();
  })
})