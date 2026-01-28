import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function ThrowError() {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(
      screen.getByText('Ocorreu um erro inesperado. Por favor, tente novamente.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recarregar Página' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir para Início' })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should call window.location.reload when reload button clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock, href: '' },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Recarregar Página' }));
    expect(reloadMock).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
