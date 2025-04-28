import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'

function HelloWorld() {
    return <h1>Hello, World!</h1>;
}

test('renders Hello World', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});
